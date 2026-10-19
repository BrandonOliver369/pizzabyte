/**
 * ==============================================================================
 * SCRIPT DE PRUEBAS AUTOMATIZADAS: 5 CONTROLADORES CRUD DE POSTGRESQL
 * ==============================================================================
 * Ejecuta pruebas de consumo HTTP sobre los 5 controladores implementados:
 * 1. /api/productos (Catálogo de Pizzas)
 * 2. /api/ingredientes (Inventario y Recetas)
 * 3. /api/cupones (Promociones y Descuentos)
 * 4. /api/pedidos (Comandas KDS y Pasarela)
 * 5. /api/usuarios (Cuentas y Roles con SHA-256)
 */

const BASE_URL = 'http://localhost:8080';

async function peticion(ruta, metodo = 'GET', cuerpo = null) {
  const opciones = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' }
  };
  if (cuerpo) opciones.body = JSON.stringify(cuerpo);
  try {
    const resp = await fetch(`${BASE_URL}${ruta}`, opciones);
    const data = await resp.json().catch(() => ({}));
    return { status: resp.status, data };
  } catch (err) {
    return { status: 0, error: err.message, data: { success: false, error: err.message } };
  }
}

async function ejecutarPruebas() {
  console.log('\n================================================================');
  console.log(' 🧪 INICIANDO BATERÍA DE PRUEBAS CRUD EN POSTGRESQL (PIZZABYTE) ');
  console.log('================================================================\n');

  // 0. Verificar si el servidor backend está encendido
  const ping = await peticion('/api/db/status', 'GET');
  if (ping.status !== 200 || !ping.data?.conectado) {
    console.error('❌ ERROR CRÍTICO: No se pudo conectar al servidor backend en ' + BASE_URL);
    console.error('   Por favor asegúrate de encender el backend ejecutando en otra terminal:');
    console.error('   👉 npm run server   (o node server.js)\n');
    process.exit(1);
  }

  console.log(`🔌 Conexión confirmada con ${ping.data.motor} [${ping.data.baseDeDatos}.${ping.data.esquema}]`);

  let totalPruebas = 0;
  let exitosas = 0;

  function registrar(titulo, ok, detalle) {
    totalPruebas++;
    if (ok) exitosas++;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${totalPruebas}] ${titulo}`);
    if (detalle) console.log(`   └─ Detalle:`, detalle);
  }

  const stamp = Date.now();

  // --------------------------------------------------------------------------
  // CONTROLADOR 1: PRODUCTOS (/api/productos)
  // --------------------------------------------------------------------------
  console.log('\n--- 1. CONTROLADOR DE PRODUCTOS (CRUD) ---');
  
  // 1.1 CREATE
  const prodNuevo = await peticion('/api/productos', 'POST', {
    categoria_id: 1,
    nombre: 'Pizza Trufa Negra & Funghi (TEST CRUD)',
    descripcion: 'Champiñones salteados, aceite de trufa blanca y fior di latte.',
    precio_base: 18.50,
    imagen_url: 'trufa.jpg',
    disponible: true
  });
  const prodId = prodNuevo.data?.data?.id;
  registrar('PRODUCTOS - CREATE: Insertar nueva pizza en PostgreSQL', prodNuevo.status === 201 && prodId, `ID generado: #${prodId}`);

  // 1.2 READ ALL
  const prodList = await peticion('/api/productos', 'GET');
  registrar('PRODUCTOS - READ ALL: Listar catálogo completo', prodList.status === 200 && prodList.data?.total > 0, `Total pizzas: ${prodList.data?.total}`);

  // 1.3 READ ONE
  const prodOne = await peticion(`/api/productos/${prodId}`, 'GET');
  registrar('PRODUCTOS - READ ONE: Consultar producto por ID con receta', prodOne.status === 200 && prodOne.data?.data?.nombre?.includes('Trufa'), `Nombre: ${prodOne.data?.data?.nombre}`);

  // 1.4 UPDATE
  const prodUpd = await peticion(`/api/productos/${prodId}`, 'PUT', {
    precio_base: 19.99,
    descripcion: 'Edición gourmet limitada con extra trufa fresca.'
  });
  registrar('PRODUCTOS - UPDATE: Modificar precio y descripción', prodUpd.status === 200 && prodUpd.data?.data?.precio_base == 19.99, `Nuevo precio: $${prodUpd.data?.data?.precio_base}`);

  // 1.5 DELETE
  const prodDel = await peticion(`/api/productos/${prodId}`, 'DELETE');
  registrar('PRODUCTOS - DELETE: Eliminar producto de la base de datos', prodDel.status === 200 && prodDel.data?.success, `Eliminado ID: #${prodDel.data?.data?.id}`);

  // --------------------------------------------------------------------------
  // CONTROLADOR 2: INGREDIENTES (/api/ingredientes)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. CONTROLADOR DE INGREDIENTES (CRUD) ---');

  // 2.1 CREATE
  const ingNuevo = await peticion('/api/ingredientes', 'POST', {
    nombre: `Albahaca Genovesa (${stamp})`,
    costo_extra: 0.90,
    stock_disponible: 120,
    unidad_medida: 'ramillete'
  });
  const ingId = ingNuevo.data?.data?.id;
  registrar('INGREDIENTES - CREATE: Insertar ingrediente', ingNuevo.status === 201 && ingId, `ID generado: #${ingId}`);

  // 2.2 READ ALL
  const ingList = await peticion('/api/ingredientes', 'GET');
  registrar('INGREDIENTES - READ ALL: Listar todos los ingredientes', ingList.status === 200 && ingList.data?.total > 0, `Total ingredientes: ${ingList.data?.total}`);

  // 2.3 READ ONE
  const ingOne = await peticion(`/api/ingredientes/${ingId}`, 'GET');
  registrar('INGREDIENTES - READ ONE: Obtener ingrediente por ID', ingOne.status === 200 && ingOne.data?.data?.nombre?.includes('Albahaca'), `Nombre: ${ingOne.data?.data?.nombre}`);

  // 2.4 UPDATE
  const ingUpd = await peticion(`/api/ingredientes/${ingId}`, 'PUT', {
    costo_extra: 1.10,
    stock_disponible: 150
  });
  registrar('INGREDIENTES - UPDATE: Actualizar costo adicional', ingUpd.status === 200 && ingUpd.data?.data?.costo_extra == 1.10, `Nuevo costo: $${ingUpd.data?.data?.costo_extra}`);

  // 2.5 DELETE
  const ingDel = await peticion(`/api/ingredientes/${ingId}`, 'DELETE');
  registrar('INGREDIENTES - DELETE: Eliminar ingrediente', ingDel.status === 200 && ingDel.data?.success, `Eliminado ID: #${ingDel.data?.data?.id}`);

  // --------------------------------------------------------------------------
  // CONTROLADOR 3: CUPONES DE DESCUENTO (/api/cupones)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. CONTROLADOR DE CUPONES DE DESCUENTO (CRUD) ---');

  // 3.1 CREATE
  const cupCode = 'PROFE_' + stamp;
  const cupNuevo = await peticion('/api/cupones', 'POST', {
    codigo: cupCode,
    porcentaje_descuento: 20.00,
    monto_minimo_compra: 15.00,
    usos_maximos: 100,
    activo: true
  });
  const cupId = cupNuevo.data?.data?.id;
  registrar('CUPONES - CREATE: Crear cupón promocional', cupNuevo.status === 201 && cupId, `Cupón: ${cupNuevo.data?.data?.codigo}`);

  // 3.2 READ ALL
  const cupList = await peticion('/api/cupones', 'GET');
  registrar('CUPONES - READ ALL: Listar todos los cupones activos', cupList.status === 200 && cupList.data?.total > 0, `Total cupones: ${cupList.data?.total}`);

  // 3.3 READ ONE (por código o id)
  const cupOne = await peticion(`/api/cupones/${cupCode}`, 'GET');
  registrar('CUPONES - READ ONE: Validar cupón por código', cupOne.status === 200 && cupOne.data?.data?.porcentaje_descuento == 20.00, `Descuento: ${cupOne.data?.data?.porcentaje_descuento}%`);

  // 3.4 UPDATE
  const cupUpd = await peticion(`/api/cupones/${cupId}`, 'PUT', {
    porcentaje_descuento: 25.00,
    usos_maximos: 200
  });
  registrar('CUPONES - UPDATE: Incrementar beneficio del cupón', cupUpd.status === 200 && cupUpd.data?.data?.porcentaje_descuento == 25.00, `Nuevo %: ${cupUpd.data?.data?.porcentaje_descuento}%`);

  // 3.5 DELETE
  const cupDel = await peticion(`/api/cupones/${cupId}`, 'DELETE');
  registrar('CUPONES - DELETE: Dar de baja cupón', cupDel.status === 200 && cupDel.data?.success, `Eliminado ID: #${cupDel.data?.data?.id}`);

  // --------------------------------------------------------------------------
  // CONTROLADOR 4: PEDIDOS / COMANDAS KDS (/api/pedidos)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. CONTROLADOR DE PEDIDOS Y COMANDAS KDS (CRUD) ---');

  // 4.1 CREATE
  const pedNuevo = await peticion('/api/pedidos', 'POST', {
    cliente_id: 2,
    origen_pedido: 'WEB',
    tipo_entrega: 'A_DOMICILIO',
    notas_cocina: 'Prueba de comanda automatizada CRUD',
    estado_codigo: 'CONFIRMADO',
    producto_id: 1,
    tamano_id: 3,
    cantidad: 2,
    precio_unitario: 14.50,
    metodo_pago_codigo: 'PAYPAL',
    id_transaccion_paypal: 'PAYID-CRUD-' + stamp
  });
  const pedId = pedNuevo.data?.data?.pedido?.id;
  const folio = pedNuevo.data?.data?.pedido?.folio_comanda;
  registrar('PEDIDOS - CREATE: Insertar orden con detalles y pago', pedNuevo.status === 201 && pedId, `ID: #${pedId} (Folio: ${folio})`);

  // 4.2 READ ALL (Tablero KDS de Cocina)
  const pedList = await peticion('/api/pedidos', 'GET');
  registrar('PEDIDOS - READ ALL: Consultar comanda en vista KDS', pedList.status === 200 && pedList.data?.total > 0, `Comandas activas: ${pedList.data?.total}`);

  // 4.3 READ ONE
  const pedOne = await peticion(`/api/pedidos/${pedId}`, 'GET');
  registrar('PEDIDOS - READ ONE: Consultar orden individual con desglose', pedOne.status === 200 && pedOne.data?.data?.detalles?.length > 0, `Detalles vinculados: ${pedOne.data?.data?.detalles?.length}`);

  // 4.4 UPDATE (Transición de estado en cocina KDS)
  const pedUpd = await peticion(`/api/pedidos/${pedId}`, 'PATCH', {
    estado_codigo: 'EN_HORNO',
    notas_cocina: 'Comanda ingresada a horno de piedra por pizzero'
  });
  registrar('PEDIDOS - UPDATE: Transicionar comanda en Kanban (EN_HORNO)', pedUpd.status === 200 && pedUpd.data?.data?.estado_id === 3, `Nuevo estado_id: ${pedUpd.data?.data?.estado_id}`);

  // 4.5 DELETE
  const pedDel = await peticion(`/api/pedidos/${pedId}`, 'DELETE');
  registrar('PEDIDOS - DELETE: Cancelar / Borrar comanda de prueba', pedDel.status === 200 && pedDel.data?.success, `Comanda cancelada: ${pedDel.data?.data?.folio_comanda}`);

  // --------------------------------------------------------------------------
  // CONTROLADOR 5: USUARIOS / CLIENTES (/api/usuarios)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. CONTROLADOR DE USUARIOS (CRUD) ---');

  // 5.1 CREATE
  const usrNuevo = await peticion('/api/usuarios', 'POST', {
    username: 'profesor_' + stamp,
    email: `profesor_${stamp}@pizzabyte.edu`,
    password: 'evaluacion2026',
    nombre_completo: 'Profesor Titular de Base de Datos',
    telefono: '5544332211',
    rol_codigo: 'ADMIN'
  });
  const usrId = usrNuevo.data?.data?.id;
  registrar('USUARIOS - CREATE: Registrar usuario con Hash SHA-256', usrNuevo.status === 201 && usrId, `Usuario: ${usrNuevo.data?.data?.username}`);

  // 5.2 READ ALL
  const usrList = await peticion('/api/usuarios', 'GET');
  registrar('USUARIOS - READ ALL: Listar todos los usuarios y roles', usrList.status === 200 && usrList.data?.total > 0, `Total usuarios: ${usrList.data?.total}`);

  // 5.3 READ ONE
  const usrOne = await peticion(`/api/usuarios/${usrId}`, 'GET');
  registrar('USUARIOS - READ ONE: Consultar perfil de usuario por ID', usrOne.status === 200 && usrOne.data?.data?.email?.includes('profesor'), `Nombre: ${usrOne.data?.data?.nombre_completo}`);

  // 5.4 UPDATE
  const usrUpd = await peticion(`/api/usuarios/${usrId}`, 'PUT', {
    nombre_completo: 'Dr. Profesor de Ingeniería de Software',
    telefono: '5599887766'
  });
  registrar('USUARIOS - UPDATE: Modificar datos de perfil', usrUpd.status === 200 && usrUpd.data?.data?.telefono === '5599887766', `Nombre actualizado: ${usrUpd.data?.data?.nombre_completo}`);

  // 5.5 DELETE
  const usrDel = await peticion(`/api/usuarios/${usrId}`, 'DELETE');
  registrar('USUARIOS - DELETE: Eliminar usuario de prueba de PostgreSQL', usrDel.status === 200 && usrDel.data?.success, `Eliminado: ${usrDel.data?.data?.username}`);

  // --------------------------------------------------------------------------
  // RESUMEN FINAL
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(` 🏆 RESULTADOS: ${exitosas} de ${totalPruebas} PRUEBAS CRUD EXITOSAS (${Math.round((exitosas/totalPruebas)*100)}%)`);
  console.log('================================================================\n');
}

ejecutarPruebas().catch(err => {
  console.error('Error durante la ejecución del test suite:', err);
  process.exit(1);
});
