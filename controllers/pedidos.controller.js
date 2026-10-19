/**
 * ==============================================================================
 * CONTROLADOR 4: PEDIDOS / COMANDAS KDS (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre las tablas:
 * - 'pizzabyte_core.pedidos'
 * - 'pizzabyte_core.pedido_detalles'
 * - 'pizzabyte_core.vista_kds_cocina'
 */

const { pool } = require('../db');

function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Listar pedidos (Consola KDS Cocina)
async function listar(req, res) {
  try {
    const query = `
      SELECT 
        p.id,
        p.folio_comanda,
        COALESCE(u.nombre_completo, 'Cliente Web') AS "clienteNombre",
        COALESCE(u.email, 'correo@cliente.com') AS "correoCliente",
        u.telefono AS "clienteTelefono",
        p.origen_pedido AS "origen",
        p.tipo_entrega AS "tipoEntrega",
        CONCAT(du.calle_numero, ', ', col.nombre) AS "direccionEntrega",
        p.notas_cocina AS "notasCocina",
        ep.codigo AS "estado",
        ep.nombre AS "estadoNombre",
        ep.orden_secuencia AS "ordenSecuencia",
        p.descuento_aplicado,
        p.costo_envio,
        p.fecha_creacion,
        to_char(p.fecha_creacion, 'DD Mon, HH24:MI') AS "fechaFormato",
        COALESCE(
          (SELECT pr.nombre FROM pedido_detalles pd JOIN productos pr ON pd.producto_id = pr.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Pizza Personalizada Byte'
        ) AS "saborPizza",
        COALESCE(
          (SELECT t.nombre FROM pedido_detalles pd JOIN tamanos t ON pd.tamano_id = t.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Grande Familiar'
        ) AS "tamano",
        COALESCE(
          (SELECT SUM(pd.cantidad * pd.precio_unitario) FROM pedido_detalles pd WHERE pd.pedido_id = p.id),
          14.50
        ) - p.descuento_aplicado + p.costo_envio AS "precioTotal",
        COALESCE(
          (SELECT mp.codigo FROM transacciones_pago tp JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id WHERE tp.pedido_id = p.id LIMIT 1),
          'EFECTIVO'
        ) AS "metodoPago",
        COALESCE(
          (SELECT tp_pay.id_transaccion_paypal FROM transacciones_pago tp JOIN transacciones_paypal tp_pay ON tp.id = tp_pay.transaccion_id WHERE tp.pedido_id = p.id LIMIT 1),
          null
        ) AS "idTransaccionPaypal",
        COALESCE(
          (SELECT est.codigo FROM transacciones_pago tp JOIN estados_pago est ON tp.estado_pago_id = est.id WHERE tp.pedido_id = p.id LIMIT 1),
          'PAGADO'
        ) AS "estadoPago"
      FROM pedidos p
      JOIN estados_pedido ep ON p.estado_id = ep.id
      LEFT JOIN usuarios u ON p.cliente_id = u.id
      LEFT JOIN direcciones_usuario du ON p.direccion_id = du.id
      LEFT JOIN colonias col ON du.colonia_id = col.id
      ORDER BY p.fecha_creacion DESC
    `;
    const resultado = await pool.query(query);
    responder(res, 200, {
      success: true,
      total: resultado.rows.length,
      data: resultado.rows
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 2. READ ONE - Obtener comanda con sus productos y extras
async function obtenerPorId(req, res, id) {
  try {
    const pQuery = `
      SELECT p.*, ep.codigo AS estado_codigo, ep.nombre AS estado_nombre,
             u.nombre_completo AS cliente_nombre, u.email AS cliente_email
      FROM pedidos p
      JOIN estados_pedido ep ON p.estado_id = ep.id
      LEFT JOIN usuarios u ON p.cliente_id = u.id
      WHERE p.id = $1
    `;
    const pRes = await pool.query(pQuery, [id]);
    if (pRes.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Pedido #${id} no encontrado` });
    }

    const itemsQuery = `
      SELECT pd.id, pr.nombre AS producto_nombre, t.nombre AS tamano_nombre,
             pd.cantidad, pd.precio_unitario, (pd.cantidad * pd.precio_unitario) AS subtotal
      FROM pedido_detalles pd
      JOIN productos pr ON pd.producto_id = pr.id
      JOIN tamanos t ON pd.tamano_id = t.id
      WHERE pd.pedido_id = $1
    `;
    const itemsRes = await pool.query(itemsQuery, [id]);

    const pedido = pRes.rows[0];
    pedido.detalles = itemsRes.rows;

    responder(res, 200, { success: true, data: pedido });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Insertar un nuevo pedido completo
async function crear(req, res, body) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { cliente_id, origen_pedido, tipo_entrega, notas_cocina, estado_codigo, cupon_id, producto_id, tamano_id, cantidad, precio_unitario, metodo_pago_codigo, id_transaccion_paypal } = body;

    const folio = 'PB-' + Math.floor(1000 + Math.random() * 9000);
    
    // Obtener estado ID
    const estRes = await client.query('SELECT id FROM estados_pedido WHERE codigo = $1 LIMIT 1', [estado_codigo || 'CONFIRMADO']);
    const estadoId = estRes.rows[0] ? estRes.rows[0].id : 2;

    const pQuery = `
      INSERT INTO pedidos (folio_comanda, cliente_id, origen_pedido, tipo_entrega, notas_cocina, estado_id, cupon_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const pRes = await client.query(pQuery, [
      folio,
      cliente_id || 2,
      origen_pedido || 'WEB',
      tipo_entrega || 'A_DOMICILIO',
      notas_cocina || 'Sin notas especiales',
      estadoId,
      cupon_id || null
    ]);
    const nuevoPedido = pRes.rows[0];

    // Detalle de la pizza
    const dQuery = `
      INSERT INTO pedido_detalles (pedido_id, producto_id, tamano_id, cantidad, precio_unitario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const precio = precio_unitario || 14.50;
    const dRes = await client.query(dQuery, [
      nuevoPedido.id,
      producto_id || 1,
      tamano_id || 3,
      cantidad || 1,
      precio
    ]);

    // Transacción de pago
    const mpRes = await client.query('SELECT id FROM metodos_pago WHERE codigo = $1 LIMIT 1', [metodo_pago_codigo || 'TARJETA']);
    const metodoId = mpRes.rows[0] ? mpRes.rows[0].id : 1;

    const tpQuery = `
      INSERT INTO transacciones_pago (pedido_id, metodo_pago_id, estado_pago_id, monto)
      VALUES ($1, $2, 2, $3)
      RETURNING *
    `;
    const tpRes = await client.query(tpQuery, [nuevoPedido.id, metodoId, precio]);

    // Si es PayPal, registrar en transacciones_paypal
    if (metodo_pago_codigo === 'PAYPAL' || id_transaccion_paypal) {
      await client.query(`
        INSERT INTO transacciones_paypal (transaccion_id, id_transaccion_paypal)
        VALUES ($1, $2)
      `, [tpRes.rows[0].id, id_transaccion_paypal || ('PAYID-' + Math.floor(100000 + Math.random() * 900000))]);
    }

    await client.query('COMMIT');
    responder(res, 201, {
      success: true,
      mensaje: `Pedido #${nuevoPedido.id} (${folio}) registrado exitosamente en PostgreSQL`,
      data: {
        pedido: nuevoPedido,
        detalles: dRes.rows[0]
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    responder(res, 500, { success: false, error: err.message });
  } finally {
    client.release();
  }
}

// 4. UPDATE - Actualizar estado en cocina KDS o notas
async function actualizar(req, res, id, body) {
  try {
    const { estado_codigo, notas_cocina } = body;
    let estadoId = null;
    if (estado_codigo) {
      const eRes = await pool.query('SELECT id FROM estados_pedido WHERE codigo = $1 LIMIT 1', [estado_codigo]);
      if (eRes.rows[0]) estadoId = eRes.rows[0].id;
    }

    const query = `
      UPDATE pedidos
      SET estado_id = COALESCE($1, estado_id),
          notas_cocina = COALESCE($2, notas_cocina)
      WHERE id = $3
      RETURNING *
    `;
    const resultado = await pool.query(query, [estadoId, notas_cocina, id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Pedido #${id} no encontrado para actualizar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Pedido #${id} actualizado exitosamente`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 5. DELETE - Cancelar o eliminar pedido
async function eliminar(req, res, id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Eliminar transacciones de pago asociadas (PayPal se elimina en cascada)
    await client.query(`DELETE FROM transacciones_pago WHERE pedido_id = $1`, [id]);
    // Eliminar detalles del pedido
    await client.query(`DELETE FROM pedido_detalles WHERE pedido_id = $1`, [id]);
    // Eliminar auditorías
    await client.query(`DELETE FROM auditoria_estados_pedido WHERE pedido_id = $1`, [id]);

    const query = `DELETE FROM pedidos WHERE id = $1 RETURNING id, folio_comanda`;
    const resultado = await client.query(query, [id]);

    if (resultado.rows.length === 0) {
      await client.query('ROLLBACK');
      return responder(res, 404, { success: false, mensaje: `Pedido #${id} no encontrado para eliminar` });
    }

    await client.query('COMMIT');
    responder(res, 200, {
      success: true,
      mensaje: `Pedido #${id} (${resultado.rows[0].folio_comanda}) eliminado exitosamente de la base de datos`,
      data: resultado.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    responder(res, 500, { success: false, error: err.message });
  } finally {
    client.release();
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
