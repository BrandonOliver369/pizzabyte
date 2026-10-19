/**
 * ==============================================================================
 * CONTROLADOR 3: CUPONES DE DESCUENTO (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.cupones_descuento'
 * Columnas exactas del esquema normalizado 3NF:
 * id, codigo, porcentaje_descuento, monto_minimo_compra, usos_maximos, usos_actuales, activo, fecha_expiracion
 */

const { pool } = require('../db');

function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Listar cupones
async function listar(req, res) {
  try {
    const query = `
      SELECT id, codigo, porcentaje_descuento, monto_minimo_compra, 
             usos_maximos, usos_actuales, activo, fecha_expiracion
      FROM cupones_descuento
      ORDER BY id ASC
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

// 2. READ ONE - Obtener cupón por ID o Código
async function obtenerPorId(req, res, id) {
  try {
    let query, valores;
    if (isNaN(id)) {
      query = `SELECT * FROM cupones_descuento WHERE UPPER(codigo) = UPPER($1)`;
      valores = [id];
    } else {
      query = `SELECT * FROM cupones_descuento WHERE id = $1`;
      valores = [id];
    }
    const resultado = await pool.query(query, valores);
    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Cupón '${id}' no encontrado` });
    }
    responder(res, 200, { success: true, data: resultado.rows[0] });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Insertar nuevo cupón
async function crear(req, res, body) {
  try {
    const { codigo, porcentaje_descuento, monto_minimo_compra, usos_maximos, activo, fecha_expiracion } = body;
    if (!codigo || porcentaje_descuento === undefined) {
      return responder(res, 400, { success: false, mensaje: 'codigo y porcentaje_descuento son obligatorios' });
    }

    const query = `
      INSERT INTO cupones_descuento (codigo, porcentaje_descuento, monto_minimo_compra, usos_maximos, activo, fecha_expiracion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const valores = [
      codigo.toUpperCase().trim(),
      parseFloat(porcentaje_descuento),
      monto_minimo_compra !== undefined ? parseFloat(monto_minimo_compra) : 0.00,
      usos_maximos !== undefined ? parseInt(usos_maximos, 10) : 100,
      activo !== false,
      fecha_expiracion || null
    ];

    const resultado = await pool.query(query, valores);
    responder(res, 201, {
      success: true,
      mensaje: 'Cupón creado exitosamente en PostgreSQL',
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 4. UPDATE - Actualizar cupón
async function actualizar(req, res, id, body) {
  try {
    const { codigo, porcentaje_descuento, monto_minimo_compra, usos_maximos, activo, fecha_expiracion } = body;
    const query = `
      UPDATE cupones_descuento
      SET codigo = COALESCE($1, codigo),
          porcentaje_descuento = COALESCE($2, porcentaje_descuento),
          monto_minimo_compra = COALESCE($3, monto_minimo_compra),
          usos_maximos = COALESCE($4, usos_maximos),
          activo = COALESCE($5, activo),
          fecha_expiracion = COALESCE($6, fecha_expiracion)
      WHERE id = $7
      RETURNING *
    `;
    const valores = [
      codigo ? codigo.toUpperCase().trim() : null,
      porcentaje_descuento !== undefined ? parseFloat(porcentaje_descuento) : null,
      monto_minimo_compra !== undefined ? parseFloat(monto_minimo_compra) : null,
      usos_maximos !== undefined ? parseInt(usos_maximos, 10) : null,
      activo,
      fecha_expiracion,
      id
    ];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Cupón #${id} no encontrado para actualizar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Cupón #${id} actualizado exitosamente`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 5. DELETE - Dar de baja o eliminar cupón
async function eliminar(req, res, id) {
  try {
    const query = `DELETE FROM cupones_descuento WHERE id = $1 RETURNING id, codigo`;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Cupón #${id} no encontrado para eliminar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Cupón #${id} (${resultado.rows[0].codigo}) eliminado de la base de datos`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
