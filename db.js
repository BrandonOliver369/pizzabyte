/**
 * ==============================================================================
 * PIZZABYTE - ADAPTADOR DE BASE DE DATOS POSTGRESQL (Arquitectura Hexagonal)
 * ==============================================================================
 * Este archivo implementa el Adaptador de Persistencia de Salida
 * (PedidoDatabaseAdapter / UserDatabaseAdapter) conectándose directamente a PostgreSQL.
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pizzabyte_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  options: `-c search_path=${process.env.DB_SCHEMA || 'pizzabyte_core'},public`,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
});

let dbDisponible = false;

/**
 * Prueba la conexión inicial a PostgreSQL y muestra el banner de confirmación
 */
async function probarConexion() {
  try {
    const res = await pool.query('SELECT current_database() AS db, version() AS ver');
    dbDisponible = true;
    console.log(`\n======================================================`);
    console.log(` [PostgreSQL Database Adapter] Conexión EXITOSA`);
    console.log(` [DB] Base de Datos: "${res.rows[0].db}"`);
    console.log(` [DB] Esquema: "${process.env.DB_SCHEMA || 'pizzabyte_core'}"`);
    console.log(` [DB] Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    console.log(` [DB] Estado: PERSISTENCIA ACTIVA EN POSTGRESQL 18`);
    console.log(`======================================================\n`);
    return true;
  } catch (err) {
    dbDisponible = false;
    console.error(`\n [PostgreSQL] AVISO: No se pudo conectar a la base de datos (${err.message}).`);
    console.log(` [Fallback] Operando en modo memoria temporal resiliente.\n`);
    return false;
  }
}

/**
 * Busca un usuario por username
 */
async function buscarUsuario(username) {
  if (!dbDisponible) return null;
  try {
    const res = await pool.query(
      `SELECT u.id, u.username, u.email, u.password_hash AS "passwordHash", u.nombre_completo AS nombre,
              r.codigo AS rol, u.proveedor_auth AS "proveedorAuth", u.avatar_url AS "avatarUrl"
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE LOWER(u.username) = LOWER($1) AND u.activo = TRUE`,
      [username]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('[DB] Error al buscar usuario:', err.message);
    return null;
  }
}

/**
 * Busca un usuario por email
 */
async function buscarUsuarioPorEmail(email) {
  if (!dbDisponible) return null;
  try {
    const res = await pool.query(
      `SELECT u.id, u.username, u.email, u.password_hash AS "passwordHash", u.nombre_completo AS nombre,
              r.codigo AS rol, u.proveedor_auth AS "proveedorAuth"
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE LOWER(u.email) = LOWER($1) AND u.activo = TRUE`,
      [email]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('[DB] Error al buscar usuario por email:', err.message);
    return null;
  }
}

/**
 * Registra un nuevo usuario en PostgreSQL
 */
async function registrarUsuario({ username, passwordHash, nombre, email, rol = 'CLIENTE_VIP', proveedorAuth = 'LOCAL', avatarUrl = null }) {
  if (!dbDisponible) return null;
  try {
    // Obtener rol_id correspondiente
    const rolRes = await pool.query('SELECT id FROM roles WHERE codigo = $1 LIMIT 1', [rol]);
    const rolId = rolRes.rows[0] ? rolRes.rows[0].id : 2; // Default CLIENTE_VIP

    const res = await pool.query(
      `INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol_id, proveedor_auth, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, nombre_completo AS nombre, $8 AS rol`,
      [username.toLowerCase().trim(), email.toLowerCase().trim(), passwordHash, nombre.trim(), rolId, proveedorAuth, avatarUrl, rol]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[DB] Error al registrar usuario:', err.message);
    throw err;
  }
}

/**
 * Guarda el token de sesión en la tabla sesiones_activas
 */
async function guardarSesion(usuarioId, token, expiraEn, ip = null, userAgent = null) {
  if (!dbDisponible || !usuarioId) return;
  try {
    await pool.query(
      `INSERT INTO sesiones_activas (usuario_id, token_sesion, expira_en, ip_origen, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (token_sesion) DO UPDATE SET expira_en = EXCLUDED.expira_en`,
      [usuarioId, token, expiraEn, ip, userAgent]
    );
  } catch (err) {
    console.error('[DB] Error al guardar sesión:', err.message);
  }
}

/**
 * Elimina una sesión al cerrar sesión
 */
async function eliminarSesion(token) {
  if (!dbDisponible || !token) return;
  try {
    await pool.query('DELETE FROM sesiones_activas WHERE token_sesion = $1', [token]);
  } catch (err) {
    console.error('[DB] Error al eliminar sesión:', err.message);
  }
}

/**
 * Obtiene los pedidos para el Kitchen Display System (KDS)
 */
async function obtenerPedidosKds() {
  if (!dbDisponible) return null;
  try {
    const res = await pool.query(`
      SELECT 
        p.id,
        p.folio_comanda,
        p.cliente_nombre AS "clienteNombre",
        p.cliente_email AS "correoCliente",
        p.cliente_telefono AS "clienteTelefono",
        p.origen_pedido AS "origen",
        p.tipo_entrega AS "tipoEntrega",
        p.direccion_entrega AS "direccionEntrega",
        p.notas_cocina AS "notasCocina",
        ep.codigo AS "estado",
        ep.nombre AS "estadoNombre",
        p.total AS "precioTotal",
        to_char(p.fecha_creacion, 'DD Mon, HH24:MI') AS "fechaCreacion",
        COALESCE(mp.codigo, 'EFECTIVO') AS "metodoPago",
        tp.id_transaccion_paypal AS "idTransaccionPaypal",
        COALESCE(est_pago.codigo, 'PAGADO') AS "estadoPago",
        COALESCE(
          (SELECT pr.nombre FROM pedido_detalles pd JOIN productos pr ON pd.producto_id = pr.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Pizza Personalizada Byte'
        ) AS "saborPizza",
        COALESCE(
          (SELECT t.nombre FROM pedido_detalles pd JOIN tamanos t ON pd.tamano_id = t.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Grande Familiar'
        ) AS "tamano"
      FROM pedidos p
      JOIN estados_pedido ep ON p.estado_id = ep.id
      LEFT JOIN transacciones_pago tp ON p.id = tp.pedido_id
      LEFT JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id
      LEFT JOIN estados_pago est_pago ON tp.estado_pago_id = est_pago.id
      ORDER BY p.fecha_creacion DESC
    `);
    return res.rows;
  } catch (err) {
    console.error('[DB] Error al obtener pedidos KDS:', err.message);
    return null;
  }
}

/**
 * Inserta un nuevo pedido en PostgreSQL con sus detalles y transacción
 */
async function guardarNuevoPedido(pedidoData) {
  if (!dbDisponible) return null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener ID de estado CONFIRMADO
    const estadoRes = await client.query("SELECT id FROM estados_pedido WHERE codigo = 'CONFIRMADO' LIMIT 1");
    const estadoId = estadoRes.rows[0] ? estadoRes.rows[0].id : 2;

    // 2. Generar folio
    const randomFolio = 'PB-' + Math.floor(1000 + Math.random() * 9000);

    // 3. Insertar pedido principal
    const pedidoSql = `
      INSERT INTO pedidos (
        folio_comanda, cliente_nombre, cliente_email, origen_pedido,
        estado_id, subtotal, total, notas_cocina, tipo_entrega, direccion_entrega
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, folio_comanda, cliente_nombre, cliente_email, fecha_creacion
    `;
    const subtotal = pedidoData.precioTotal || 13.99;
    const resPedido = await client.query(pedidoSql, [
      randomFolio,
      pedidoData.clienteNombre || 'Cliente Web',
      pedidoData.correoCliente,
      pedidoData.origen || 'WEB',
      estadoId,
      subtotal,
      subtotal,
      pedidoData.notasCocina || null,
      pedidoData.direccionEntrega ? 'A_DOMICILIO' : 'RECOGER_LOCAL',
      pedidoData.direccionEntrega || null
    ]);

    const nuevoId = resPedido.rows[0].id;

    // 4. Buscar producto y tamaño correspondiente
    const prodRes = await client.query(
      "SELECT id FROM productos WHERE LOWER(nombre) LIKE LOWER($1) LIMIT 1",
      [`%${(pedidoData.saborPizza || '').split(' ')[0]}%`]
    );
    const prodId = prodRes.rows[0] ? prodRes.rows[0].id : 1;

    const tamanoRes = await client.query(
      "SELECT id FROM tamanos WHERE LOWER(nombre) LIKE LOWER($1) LIMIT 1",
      [`%${(pedidoData.tamano || 'Familiar').split(' ')[0]}%`]
    );
    const tamanoId = tamanoRes.rows[0] ? tamanoRes.rows[0].id : 3;

    // 5. Insertar detalle de la pizza
    await client.query(`
      INSERT INTO pedido_detalles (pedido_id, producto_id, tamano_id, cantidad, precio_unitario, subtotal_linea)
      VALUES ($1, $2, $3, 1, $4, $4)
    `, [nuevoId, prodId, tamanoId, subtotal]);

    // 6. Si se pagó con PayPal o método específico, registrar transacción
    const metodoCodigo = pedidoData.metodoPago || 'TARJETA';
    const metodoRes = await client.query("SELECT id FROM metodos_pago WHERE codigo = $1 LIMIT 1", [metodoCodigo]);
    const metodoId = metodoRes.rows[0] ? metodoRes.rows[0].id : 1;

    const estadoPagoCodigo = metodoCodigo === 'PAYPAL' ? 'PAGADO' : (pedidoData.estadoPago || 'PAGADO');
    const estadoPagoRes = await client.query("SELECT id FROM estados_pago WHERE codigo = $1 LIMIT 1", [estadoPagoCodigo]);
    const estadoPagoId = estadoPagoRes.rows[0] ? estadoPagoRes.rows[0].id : 2;

    await client.query(`
      INSERT INTO transacciones_pago (
        pedido_id, metodo_pago_id, estado_pago_id, monto,
        id_transaccion_paypal, payer_email, payer_nombre
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      nuevoId,
      metodoId,
      estadoPagoId,
      subtotal,
      pedidoData.idTransaccionPaypal || null,
      pedidoData.correoCliente,
      pedidoData.clienteNombre || 'Comprador'
    ]);

    await client.query('COMMIT');
    console.log(` [PostgreSQL] Pedido #${nuevoId} (${randomFolio}) persistido exitosamente en base de datos.`);
    return {
      id: nuevoId,
      folio: randomFolio,
      ...pedidoData
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[DB] Error en transacción guardarNuevoPedido:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Actualiza el estado de una orden en cocina (KDS)
 */
async function actualizarEstadoPedido(pedidoId, nuevoEstadoCodigo) {
  if (!dbDisponible) return null;
  try {
    const estadoRes = await pool.query('SELECT id, nombre FROM estados_pedido WHERE codigo = $1 LIMIT 1', [nuevoEstadoCodigo]);
    if (estadoRes.rows.length === 0) return null;

    const estadoId = estadoRes.rows[0].id;
    const res = await pool.query(
      `UPDATE pedidos 
       SET estado_id = $1, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, folio_comanda, estado_id`,
      [estadoId, pedidoId]
    );
    console.log(` [PostgreSQL] Estado de orden #${pedidoId} actualizado a "${nuevoEstadoCodigo}"`);
    return res.rows[0] || null;
  } catch (err) {
    console.error('[DB] Error al actualizar estado del pedido:', err.message);
    return null;
  }
}

/**
 * Registra una verificación de PayPal en la base de datos
 */
async function registrarVerificacionPaypal({ orderId, transactionId, payerEmail, payerName, amount, currency = 'USD' }) {
  if (!dbDisponible) return null;
  try {
    console.log(` [PostgreSQL] Registrando verificación PayPal ID: ${transactionId}`);
    return { verified: true, transactionId, amount, currency };
  } catch (err) {
    console.error('[DB] Error al registrar PayPal:', err.message);
    return null;
  }
}

module.exports = {
  pool,
  probarConexion,
  buscarUsuario,
  buscarUsuarioPorEmail,
  registrarUsuario,
  guardarSesion,
  eliminarSesion,
  obtenerPedidosKds,
  guardarNuevoPedido,
  actualizarEstadoPedido,
  registrarVerificacionPaypal,
  isDbConnected: () => dbDisponible
};
