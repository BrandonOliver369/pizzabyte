/**
 * ==============================================================================
 * CONTROLADOR 2: INGREDIENTES (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.ingredientes'
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
      SELECT id, nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock
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
    const query = `SELECT * FROM ingredientes WHERE id = $1`;
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
    const { nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock } = body;
    if (!nombre) {
      return responder(res, 400, { success: false, mensaje: 'El campo nombre es obligatorio' });
    }

    const query = `
      INSERT INTO ingredientes (nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const valores = [
      nombre,
      precio_adicional || 0.00,
      es_alergeno || false,
      es_vegetariano || false,
      es_picante || false,
      en_stock !== false
    ];

    const resultado = await pool.query(query, valores);
    responder(res, 201, {
      success: true,
      mensaje: 'Ingrediente creado exitosamente en PostgreSQL',
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 4. UPDATE - Actualizar ingrediente existente
async function actualizar(req, res, id, body) {
  try {
    const { nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock } = body;
    const query = `
      UPDATE ingredientes 
      SET nombre = COALESCE($1, nombre),
          precio_adicional = COALESCE($2, precio_adicional),
          es_alergeno = COALESCE($3, es_alergeno),
          es_vegetariano = COALESCE($4, es_vegetariano),
          es_picante = COALESCE($5, es_picante),
          en_stock = COALESCE($6, en_stock)
      WHERE id = $7
      RETURNING *
    `;
    const valores = [nombre, precio_adicional, es_alergeno, es_vegetariano, es_picante, en_stock, id];
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
      mensaje: `Ingrediente #${id} (${resultado.rows[0].nombre}) eliminado exitosamente`,
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
