/**
 * ==============================================================================
 * CONTROLADOR 2: INGREDIENTES (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.ingredientes'
 * Columnas exactas del esquema normalizado 3NF:
 * id, nombre, costo_extra, stock_disponible, unidad_medida
 */

const { pool } = require('../db');

function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Listar ingredientes
async function listar(req, res) {
  try {
    const query = `
      SELECT id, nombre, costo_extra, stock_disponible, unidad_medida
      FROM ingredientes
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

// 2. READ ONE - Obtener ingrediente por ID
async function obtenerPorId(req, res, id) {
  try {
    const query = `SELECT id, nombre, costo_extra, stock_disponible, unidad_medida FROM ingredientes WHERE id = $1`;
    const resultado = await pool.query(query, [id]);
    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Ingrediente #${id} no encontrado` });
    }
    responder(res, 200, { success: true, data: resultado.rows[0] });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Insertar nuevo ingrediente
async function crear(req, res, body) {
  try {
    const { nombre, costo_extra, stock_disponible, unidad_medida } = body;
    if (!nombre) {
      return responder(res, 400, { success: false, mensaje: 'El campo nombre es obligatorio' });
    }

    const query = `
      INSERT INTO ingredientes (nombre, costo_extra, stock_disponible, unidad_medida)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const valores = [
      nombre,
      costo_extra !== undefined ? parseFloat(costo_extra) : 0.00,
      stock_disponible !== undefined ? parseInt(stock_disponible, 10) : 100,
      unidad_medida || 'porción'
    ];

    const resultado = await pool.query(query, valores);
    responder(res, 201, {
      success: true,
      mensaje: 'Ingrediente registrado exitosamente en PostgreSQL',
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 4. UPDATE - Actualizar ingrediente
async function actualizar(req, res, id, body) {
  try {
    const { nombre, costo_extra, stock_disponible, unidad_medida } = body;
    const query = `
      UPDATE ingredientes
      SET nombre = COALESCE($1, nombre),
          costo_extra = COALESCE($2, costo_extra),
          stock_disponible = COALESCE($3, stock_disponible),
          unidad_medida = COALESCE($4, unidad_medida)
      WHERE id = $5
      RETURNING *
    `;
    const valores = [
      nombre,
      costo_extra !== undefined ? parseFloat(costo_extra) : null,
      stock_disponible !== undefined ? parseInt(stock_disponible, 10) : null,
      unidad_medida,
      id
    ];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Ingrediente #${id} no encontrado para actualizar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Ingrediente #${id} actualizado exitosamente`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 5. DELETE - Eliminar ingrediente
async function eliminar(req, res, id) {
  try {
    const query = `DELETE FROM ingredientes WHERE id = $1 RETURNING id, nombre`;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Ingrediente #${id} no encontrado para eliminar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Ingrediente #${id} (${resultado.rows[0].nombre}) eliminado exitosamente de la base de datos`,
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
