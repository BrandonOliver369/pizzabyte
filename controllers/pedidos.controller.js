/**
 * ==============================================================================
 * CONTROLADOR 4: PEDIDOS Y COMANDAS KDS (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.pedidos'
 * y sus tablas asociadas de detalle y pago bajo transacciones ACID.
 * Columnas exactas del esquema normalizado 3NF:
 * id, folio_comanda, cliente_id, origen_pedido, tipo_entrega, direccion_entrega_id,
 * notas_cocina, subtotal, monto_descuento, total, estado_id, cupon_id, creado_en, actualizado_en
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
        COALESCE(u.nombre_completo, 'Cliente General') AS "clienteNombre",
        COALESCE(u.email, 'sin-correo@pizzabyte.com') AS "correoCliente",
        u.telefono AS "clienteTelefono",
        p.origen_pedido AS "origen",
        p.tipo_entrega AS "tipoEntrega",
        p.notas_cocina AS "notasCocina",
        ep.codigo AS "estado",
        ep.nombre AS "estadoNombre",
        p.subtotal,
        p.monto_descuento,
        p.total,
        p.creado_en AS "fechaCreacion",
        to_char(p.creado_en, 'DD Mon, HH24:MI') AS "fechaFormato",
        COALESCE(
          (SELECT pr.nombre FROM pedido_detalles pd JOIN productos pr ON pd.producto_id = pr.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Pizza Especial PizzaByte'
        ) AS "saborPizza",
        COALESCE(
          (SELECT t.nombre FROM pedido_detalles pd JOIN tamanos t ON pd.tamano_id = t.id WHERE pd.pedido_id = p.id LIMIT 1),
          'Familiar Grande'
        ) AS "tamano",
        COALESCE(
          (SELECT mp.codigo FROM transacciones_pago tp JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id WHERE tp.pedido_id = p.id LIMIT 1),
          'TARJETA'
        ) AS "metodoPago"
      FROM pedidos p
      JOIN estados_pedido ep ON p.estado_id = ep.id
      LEFT JOIN usuarios u ON p.cliente_id = u.id
      ORDER BY p.creado_en DESC
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

// 2. READ ONE - Obtener comanda con sus productos y desglose
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
             pd.cantidad, pd.precio_unitario, pd.importe_subtotal
      FROM pedido_detalles pd
      JOIN productos pr ON pd.producto_id = pr.id
      JOIN tamanos t ON pd.tamano_id = t.id
      WHERE pd.pedido_id = $1
    `;
    const itemsRes = await pool.query(itemsQuery, [id]);

    const pagosQuery = `
      SELECT tp.id, tp.monto, tp.moneda, tp.fecha_transaccion,
             mp.codigo AS metodo_pago, ep.codigo AS estado_pago,
             tpay.id_transaccion_paypal
      FROM transacciones_pago tp
      JOIN metodos_pago mp ON tp.metodo_pago_id = mp.id
      JOIN estados_pago ep ON tp.estado_pago_id = ep.id
      LEFT JOIN transacciones_paypal tpay ON tp.id = tpay.transaccion_id
      WHERE tp.pedido_id = $1
    `;
    const pagosRes = await pool.query(pagosQuery, [id]);

    const pedido = pRes.rows[0];
    pedido.detalles = itemsRes.rows;
    pedido.transacciones = pagosRes.rows;

    responder(res, 200, { success: true, data: pedido });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Insertar un nuevo pedido completo bajo transacción ACID
async function crear(req, res, body) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { cliente_id, origen_pedido, tipo_entrega, notas_cocina, estado_codigo, cupon_id, producto_id, tamano_id, cantidad, precio_unitario, metodo_pago_codigo, id_transaccion_paypal } = body;

    const folio = 'PB-' + Math.floor(1000 + Math.random() * 9000);
    
    // Obtener estado ID
    const estRes = await client.query('SELECT id FROM estados_pedido WHERE codigo = $1 LIMIT 1', [estado_codigo || 'CONFIRMADO']);
    const estadoId = estRes.rows[0] ? estRes.rows[0].id : 2;

    const cant = cantidad || 1;
    const precio = precio_unitario ? parseFloat(precio_unitario) : 14.50;
    const subtotal = cant * precio;
    const total = subtotal;

    const pQuery = `
      INSERT INTO pedidos (folio_comanda, cliente_id, origen_pedido, tipo_entrega, notas_cocina, subtotal, total, estado_id, cupon_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const pRes = await client.query(pQuery, [
      folio,
      cliente_id || 2,
      origen_pedido || 'WEB',
      tipo_entrega || 'A_DOMICILIO',
      notas_cocina || 'Sin notas especiales',
      subtotal,
      total,
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
    const dRes = await client.query(dQuery, [
      nuevoPedido.id,
      producto_id || 1,
      tamano_id || 3,
      cant,
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
    const tpRes = await client.query(tpQuery, [nuevoPedido.id, metodoId, total]);

    // Si es PayPal, registrar en transacciones_paypal
    if (metodo_pago_codigo === 'PAYPAL' || id_transaccion_paypal) {
      await client.query(`
        INSERT INTO transacciones_paypal (transaccion_id, id_transaccion_paypal)
        VALUES ($1, $2)
      `, [tpRes.rows[0].id, id_transaccion_paypal || ('PAYID-' + Date.now())]);
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
          notas_cocina = COALESCE($2, notas_cocina),
          actualizado_en = CURRENT_TIMESTAMP
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
