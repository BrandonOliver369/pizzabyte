-- ============================================================================
-- PROYECTO: PIZZABYTE — BASE DE DATOS EMPRESARIAL POSTGRESQL (3NF)
-- DIAGRAMA OFICIAL ENTIDAD-RELACIÓN:
--   Página 1: Usuarios, Roles, Sesiones, Direcciones, Colonias y Ciudades
--   Página 2: Catálogo, Categorías, Ingredientes, Tamaños, Cupones y Pedidos
--   Página 3: Pagos, Métodos, Transacciones, PayPal, Auditoría y Notificaciones
-- ============================================================================

-- 1. CONFIGURACIÓN DEL ESQUEMA Y EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP SCHEMA IF EXISTS pizzabyte_core CASCADE;
CREATE SCHEMA pizzabyte_core;
SET search_path TO pizzabyte_core, public;

-- ============================================================================
-- PÁGINA 1: USUARIOS Y DIRECCIONES
-- ============================================================================

-- 1.1 Tabla: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,      -- 'ADMIN', 'CLIENTE_VIP', 'OPERADOR_COCINA'
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- 1.2 Tabla: usuarios
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,    -- Hash SHA-256
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    proveedor_auth VARCHAR(20) DEFAULT 'LOCAL' 
        CHECK (proveedor_auth IN ('LOCAL', 'GOOGLE', 'FACEBOOK')),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    acepta_marketing BOOLEAN DEFAULT TRUE,
    bloqueado_arco BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Tabla: sesiones_activas
CREATE TABLE sesiones_activas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_sesion VARCHAR(128) UNIQUE NOT NULL, -- 'pb_sess_...'
    ip_origen VARCHAR(45),
    user_agent TEXT,
    expira_en TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Tabla: ciudades
CREATE TABLE ciudades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL
);

-- 1.5 Tabla: colonias
CREATE TABLE colonias (
    id SERIAL PRIMARY KEY,
    ciudad_id INT NOT NULL REFERENCES ciudades(id) ON DELETE RESTRICT,
    nombre VARCHAR(80) NOT NULL,
    codigo_postal VARCHAR(10)
);

-- 1.6 Tabla: direcciones_usuario
CREATE TABLE direcciones_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    colonia_id INT NOT NULL REFERENCES colonias(id) ON DELETE RESTRICT,
    alias VARCHAR(50) DEFAULT 'Casa',        -- 'Casa', 'Oficina', 'Trabajo'
    calle_numero VARCHAR(120) NOT NULL,
    referencias TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- PÁGINA 2: CATÁLOGO Y PEDIDOS
-- ============================================================================

-- 2.1 Tabla: categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 2.2 Tabla: productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(80) NOT NULL,
    subtitulo_italiano VARCHAR(100),
    descripcion TEXT,
    foto_url TEXT,
    precio_base NUMERIC(10, 2) NOT NULL CHECK (precio_base >= 0),
    es_popular BOOLEAN DEFAULT FALSE,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 Tabla: ingredientes
CREATE TABLE ingredientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    precio_adicional NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_adicional >= 0),
    es_alergeno BOOLEAN DEFAULT FALSE,
    es_vegetariano BOOLEAN DEFAULT FALSE,
    es_picante BOOLEAN DEFAULT FALSE,
    en_stock BOOLEAN DEFAULT TRUE
);

-- 2.4 Tabla: producto_ingredientes (Relación N:M)
CREATE TABLE producto_ingredientes (
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ingrediente_id INT NOT NULL REFERENCES ingredientes(id) ON DELETE RESTRICT,
    PRIMARY KEY (producto_id, ingrediente_id)
);

-- 2.5 Tabla: tamanos
CREATE TABLE tamanos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,      -- 'CHICA', 'MEDIANA', 'FAMILIAR'
    nombre VARCHAR(50) NOT NULL,
    multiplicador_precio NUMERIC(4, 2) NOT NULL DEFAULT 1.00 CHECK (multiplicador_precio > 0),
    porciones INT NOT NULL CHECK (porciones > 0),
    diametro_cm INT NOT NULL CHECK (diametro_cm > 0)
);

-- 2.6 Tabla: cupones_descuento
CREATE TABLE cupones_descuento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    porcentaje_descuento NUMERIC(5, 2) CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    monto_fijo_descuento NUMERIC(10, 2) DEFAULT 0.00 CHECK (monto_fijo_descuento >= 0),
    monto_minimo_compra NUMERIC(10, 2) DEFAULT 0.00 CHECK (monto_minimo_compra >= 0),
    usos_maximos INT DEFAULT 500,
    activo BOOLEAN DEFAULT TRUE,
    fecha_expiracion TIMESTAMPTZ NOT NULL
);

-- 2.7 Tabla: estados_pedido
CREATE TABLE estados_pedido (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,      -- 'CREADO', 'CONFIRMADO', 'EN_HORNO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'
    nombre VARCHAR(50) NOT NULL,
    orden_secuencia INT NOT NULL,            -- 1: Creado, 2: Confirmado, 3: En Horno, 4: En Reparto, 5: Entregado
    color_hex VARCHAR(7) DEFAULT '#3B82F6'
);

-- 2.8 Tabla: pedidos
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    folio_comanda VARCHAR(25) UNIQUE NOT NULL, -- 'PB-1001'
    cliente_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    origen_pedido VARCHAR(20) DEFAULT 'WEB' 
        CHECK (origen_pedido IN ('WEB', 'MOSTRADOR', 'TELEFONO')),
    tipo_entrega VARCHAR(20) DEFAULT 'A_DOMICILIO' 
        CHECK (tipo_entrega IN ('A_DOMICILIO', 'RECOGER_LOCAL', 'EN_MESA')),
    direccion_id BIGINT REFERENCES direcciones_usuario(id) ON DELETE SET NULL,
    notas_cocina TEXT,
    estado_id INT NOT NULL REFERENCES estados_pedido(id) ON DELETE RESTRICT,
    cupon_id INT REFERENCES cupones_descuento(id) ON DELETE SET NULL,
    descuento_aplicado NUMERIC(10, 2) DEFAULT 0.00 CHECK (descuento_aplicado >= 0),
    costo_envio NUMERIC(10, 2) DEFAULT 0.00 CHECK (costo_envio >= 0),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.9 Tabla: pedido_detalles
CREATE TABLE pedido_detalles (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    tamano_id INT NOT NULL REFERENCES tamanos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    notas_personalizadas TEXT
);

-- 2.10 Tabla: pedido_detalle_extras
CREATE TABLE pedido_detalle_extras (
    id BIGSERIAL PRIMARY KEY,
    pedido_detalle_id BIGINT NOT NULL REFERENCES pedido_detalles(id) ON DELETE CASCADE,
    ingrediente_id INT NOT NULL REFERENCES ingredientes(id) ON DELETE RESTRICT,
    precio_extra NUMERIC(10, 2) NOT NULL CHECK (precio_extra >= 0)
);

-- ============================================================================
-- PÁGINA 3: PAGOS, AUDITORÍA Y NOTIFICACIONES
-- ============================================================================

-- 3.1 Tabla: metodos_pago
CREATE TABLE metodos_pago (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,      -- 'PAYPAL', 'TARJETA', 'EFECTIVO'
    nombre VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3.2 Tabla: estados_pago
CREATE TABLE estados_pago (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,      -- 'PENDIENTE', 'PAGADO', 'REEMBOLSADO'
    nombre VARCHAR(50) NOT NULL
);

-- 3.3 Tabla: transacciones_pago
CREATE TABLE transacciones_pago (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo_pago_id INT NOT NULL REFERENCES metodos_pago(id) ON DELETE RESTRICT,
    estado_pago_id INT NOT NULL REFERENCES estados_pago(id) ON DELETE RESTRICT,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto >= 0),
    moneda VARCHAR(3) DEFAULT 'USD',
    fecha_transaccion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 Tabla: pagadores_paypal
CREATE TABLE pagadores_paypal (
    payer_id VARCHAR(80) PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    nombre VARCHAR(100)
);

-- 3.5 Tabla: transacciones_paypal (Especialización 1:0..1)
CREATE TABLE transacciones_paypal (
    transaccion_id BIGINT PRIMARY KEY REFERENCES transacciones_pago(id) ON DELETE CASCADE,
    id_transaccion_paypal VARCHAR(100) UNIQUE NOT NULL, -- 'PAYID-XXXXX'
    payer_id VARCHAR(80) REFERENCES pagadores_paypal(payer_id) ON DELETE SET NULL,
    paypal_raw_response JSONB
);

-- 3.6 Tabla: notificaciones_correo
CREATE TABLE notificaciones_correo (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    asunto VARCHAR(200) NOT NULL,
    proveedor VARCHAR(20) DEFAULT 'BREVO_API_v3',
    message_id_externo VARCHAR(100),
    estado_envio VARCHAR(20) DEFAULT 'ENVIADO' 
        CHECK (estado_envio IN ('ENVIADO', 'PENDIENTE', 'FALLIDO')),
    fecha_envio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3.7 Tabla: auditoria_estados_pedido
CREATE TABLE auditoria_estados_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    estado_anterior_id INT REFERENCES estados_pedido(id),
    estado_nuevo_id INT NOT NULL REFERENCES estados_pedido(id),
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    motivo_cambio VARCHAR(150),
    fecha_cambio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÍNDICES Y TRIGGERS DE RENDIMIENTO
-- ============================================================================

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_pedidos_estado ON pedidos(estado_id);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha_creacion DESC);
CREATE INDEX idx_cupones_codigo ON cupones_descuento(codigo);
CREATE INDEX idx_transacciones_pedido ON transacciones_pago(pedido_id);

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_fecha_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- ============================================================================
-- VISTA KDS COCINA (TABLERO KANBAN EN VIVO)
-- ============================================================================

CREATE OR REPLACE VIEW vista_kds_cocina AS
SELECT 
    p.id AS pedido_id,
    p.folio_comanda,
    u.nombre_completo AS cliente_nombre,
    u.email AS cliente_email,
    u.telefono AS cliente_telefono,
    p.origen_pedido,
    p.tipo_entrega,
    CONCAT(du.calle_numero, ', ', col.nombre, ', CP ', col.codigo_postal) AS direccion_formateada,
    p.notas_cocina,
    ep.codigo AS estado_codigo,
    ep.nombre AS estado_nombre,
    ep.orden_secuencia AS kanban_carril,
    mp.codigo AS metodo_pago,
    tp_pay.id_transaccion_paypal,
    est_pago.codigo AS estado_pago,
    p.descuento_aplicado,
    p.costo_envio,
    p.fecha_creacion,
    COALESCE(SUM(pd.cantidad * pd.precio_unitario), 0) + p.costo_envio - p.descuento_aplicado AS total_calculado,
    COUNT(pd.id) AS total_items
FROM pedidos p
JOIN estados_pedido ep ON p.estado_id = ep.id
LEFT JOIN usuarios u ON p.cliente_id = u.id
LEFT JOIN direcciones_usuario du ON p.direccion_id = du.id
LEFT JOIN colonias col ON du.colonia_id = col.id
LEFT JOIN transacciones_pago tp ON p.id = tp.pedido_id
LEFT JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id
LEFT JOIN estados_pago est_pago ON tp.estado_pago_id = est_pago.id
LEFT JOIN transacciones_paypal tp_pay ON tp.id = tp_pay.transaccion_id
LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
WHERE ep.codigo NOT IN ('ENTREGADO', 'CANCELADO')
GROUP BY p.id, ep.id, u.id, du.id, col.id, mp.codigo, tp_pay.id_transaccion_paypal, est_pago.codigo
ORDER BY p.fecha_creacion ASC;

-- ============================================================================
-- 8. GOBERNANZA DE DATOS Y DERECHOS ARCO (LFPDPPP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS solicitudes_arco (
    id BIGSERIAL PRIMARY KEY,
    folio VARCHAR(36) UNIQUE NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_derecho VARCHAR(20) NOT NULL CHECK (tipo_derecho IN ('ACCESO', 'RECTIFICACION', 'CANCELACION', 'OPOSICION')),
    estado VARCHAR(20) NOT NULL DEFAULT 'ATENDIDA' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA')),
    motivo TEXT,
    datos_especificos TEXT,
    fecha_solicitud TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arco_usuario ON solicitudes_arco(usuario_id);
CREATE INDEX IF NOT EXISTS idx_arco_folio ON solicitudes_arco(folio);

-- ============================================================================
-- DATOS SEMILLA INICIALES (SEEDS)
-- ============================================================================

-- Roles
INSERT INTO roles (codigo, nombre, descripcion) VALUES
('ADMIN', 'Administrador Maestro', 'Control total de plataforma, auditoría y staff'),
('CLIENTE_VIP', 'Cliente VIP', 'Usuario regular con beneficios de fidelidad'),
('OPERADOR_COCINA', 'Staff Cocina / Pizzero', 'Acceso exclusivo al tablero Kanban KDS');

-- Usuarios
INSERT INTO usuarios (username, email, password_hash, nombre_completo, telefono, rol_id) VALUES
('admin', 'brandooliver4@gmail.com', '767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8', 'Administrador PizzaByte', '5512345678', 1),
('brandon', 'brandooliver777@gmail.com', '6227931946d4f7130d60e51a34c2b17807ce00cd96177db1d8a6601646dacfb4', 'Brandon Oliver', '5587654321', 2);

-- Ciudades y Colonias
INSERT INTO ciudades (nombre) VALUES 
('Ciudad de México'), 
('Guadalajara'), 
('Monterrey');

INSERT INTO colonias (ciudad_id, nombre, codigo_postal) VALUES
(1, 'Colonia Juárez', '06600'),
(1, 'Roma Norte', '06700'),
(1, 'Condesa', '06140'),
(1, 'Polanco', '11560');

-- Direcciones
INSERT INTO direcciones_usuario (usuario_id, colonia_id, alias, calle_numero, referencias, es_predeterminada) VALUES
(2, 1, 'Casa', 'Av. Paseo de la Reforma #405 Int 3B', 'Entre calle Sevilla y Florencia, portón negro', TRUE);

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Pizzas Artesanales', 'Masa fermentada 48 horas con harina italiana Caputo tipo 00'),
('Bebidas y Refrescos', 'Bebidas italianas frías y refrescos artesanales'),
('Postres y Dolci', 'Postres tradicionales italianos');

-- Ingredientes
INSERT INTO ingredientes (nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock) VALUES
('Salsa de Tomate San Marzano', 0.00, FALSE, TRUE, FALSE, TRUE),
('Queso Mozzarella Fior di Latte', 0.00, TRUE, TRUE, FALSE, TRUE),
('Pepperoni Premium Artesanal', 1.50, FALSE, FALSE, FALSE, TRUE),
('Champiñones Portobello', 1.20, FALSE, TRUE, FALSE, TRUE),
('Queso Gorgonzola D.O.P.', 2.00, TRUE, TRUE, FALSE, TRUE),
('Queso Parmigiano Reggiano', 1.80, TRUE, TRUE, FALSE, TRUE),
('Jalapeños en Rodajas', 0.80, FALSE, TRUE, TRUE, TRUE),
('Chorizo Campestre Rústico', 1.50, FALSE, FALSE, TRUE, TRUE);

-- Productos
INSERT INTO productos (categoria_id, nombre, subtitulo_italiano, descripcion, precio_base, es_popular, disponible) VALUES
(1, 'Pepperoni Clásica Byte', 'Salame Piccante & Fior di Latte', 'Doble pepperoni artesanal crujiente, mozzarella hilada y salsa San Marzano.', 12.00, TRUE, TRUE),
(1, 'Cuatro Quesos Kernel', 'Quattro Formaggi Cremosi', 'Mezcla cremosa de Gorgonzola D.O.P., Fontina, Parmigiano Reggiano y Fior di Latte.', 13.50, TRUE, TRUE),
(1, 'Mexicana Fuego Byte', 'Jalapeño & Chorizo Rustico', 'Carne especiada, chorizo campestre, jalapeños al carbón y cebolla morada.', 13.00, FALSE, TRUE),
(2, 'Refresco Coca-Cola 355ml', 'Bibita Tradizionale', 'Lata fría de 355ml.', 2.50, TRUE, TRUE),
(2, 'Agua San Pellegrino 500ml', 'Acqua Minerale Frizzante', 'Agua mineral con gas importada de Italia.', 3.00, FALSE, TRUE);

-- Asignación de Recetas (producto_ingredientes)
INSERT INTO producto_ingredientes (producto_id, ingrediente_id) VALUES
(1, 1), (1, 2), (1, 3), -- Pepperoni: salsa, mozzarella, pepperoni
(2, 1), (2, 2), (2, 5), (2, 6), -- Cuatro quesos: salsa, mozzarella, gorgonzola, parmigiano
(3, 1), (3, 2), (3, 7), (3, 8); -- Mexicana: salsa, mozzarella, jalapeños, chorizo

-- Tamaños
INSERT INTO tamanos (codigo, nombre, multiplicador_precio, porciones, diametro_cm) VALUES
('CHICA', 'Individual Personal', 1.00, 4, 25),
('MEDIANA', 'Mediana Clásica', 1.25, 6, 30),
('FAMILIAR', 'Grande Familiar Byte', 1.50, 8, 40);

-- Cupones
INSERT INTO cupones_descuento (codigo, porcentaje_descuento, monto_fijo_descuento, monto_minimo_compra, usos_maximos, fecha_expiracion) VALUES
('BYTE2026', 15.00, 0.00, 10.00, 500, '2026-12-31 23:59:59+00'),
('PIZZA10', 10.00, 0.00, 12.00, 1000, '2026-12-31 23:59:59+00'),
('ENVIOFREE', 0.00, 3.50, 20.00, 200, '2026-12-31 23:59:59+00');

-- Estados de Pedido
INSERT INTO estados_pedido (codigo, nombre, orden_secuencia, color_hex) VALUES
('CREADO', 'Pedido Recibido', 1, '#64748B'),
('CONFIRMADO', 'Confirmado / En Espera', 2, '#3B82F6'),
('EN_HORNO', 'En Horno 🔥', 3, '#F59E0B'),
('EN_CAMINO', 'En Reparto 🛵', 4, '#8B5CF6'),
('ENTREGADO', 'Entregado 🎉', 5, '#10B981'),
('CANCELADO', 'Cancelado', 6, '#EF4444');

-- Métodos y Estados de Pago
INSERT INTO metodos_pago (codigo, nombre) VALUES
('PAYPAL', 'PayPal Express SDK v5'),
('TARJETA', 'Tarjeta Bancaria Crédito/Débito'),
('EFECTIVO', 'Pago Contra Entrega en Efectivo');

INSERT INTO estados_pago (codigo, nombre) VALUES
('PENDIENTE', 'Pendiente de Pago'),
('PAGADO', 'Pago Aprobado y Capturado'),
('REEMBOLSADO', 'Fondos Devueltos');

-- Pedido Inicial Demostrativo
INSERT INTO pedidos (folio_comanda, cliente_id, origen_pedido, tipo_entrega, direccion_id, notas_cocina, estado_id, cupon_id, descuento_aplicado, costo_envio)
VALUES ('PB-1001', 2, 'WEB', 'A_DOMICILIO', 1, 'Masa bien dorada y crujiente al horno de piedra', 3, 1, 2.70, 0.00);

INSERT INTO pedido_detalles (pedido_id, producto_id, tamano_id, cantidad, precio_unitario, notas_personalizadas)
VALUES (1, 1, 3, 1, 18.00, 'Extra salsa San Marzano');

INSERT INTO pedido_detalle_extras (pedido_detalle_id, ingrediente_id, precio_extra)
VALUES (1, 6, 1.80); -- Parmigiano Reggiano extra

INSERT INTO transacciones_pago (pedido_id, metodo_pago_id, estado_pago_id, monto, moneda)
VALUES (1, 1, 2, 17.10, 'USD');

INSERT INTO pagadores_paypal (payer_id, email, nombre)
VALUES ('PAYER-88492019', 'brandooliver777@gmail.com', 'Brandon Oliver');

INSERT INTO transacciones_paypal (transaccion_id, id_transaccion_paypal, payer_id, paypal_raw_response)
VALUES (1, 'PAYID-MK874921NB5521', 'PAYER-88492019', '{"id":"PAYID-MK874921NB5521","status":"COMPLETED","intent":"CAPTURE"}'::jsonb);

INSERT INTO notificaciones_correo (pedido_id, asunto, message_id_externo, estado_envio)
VALUES (1, '¡Tu orden #PB-1001 está en horno! - PizzaByte', 'brevo_msg_984321', 'ENVIADO');

INSERT INTO auditoria_estados_pedido (pedido_id, estado_anterior_id, estado_nuevo_id, usuario_id, motivo_cambio)
VALUES 
(1, 1, 2, 1, 'Confirmación de pago automático PayPal'),
(1, 2, 3, 1, 'Comanda ingresada al horno por chef pizzero');
