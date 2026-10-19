/**
 * ==============================================================================
 * CONTROLADOR 1: PRODUCTOS (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.productos'
 */

const { pool } = require('../db');

// Helper para responder en JSON
function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Obtener todos los productos
async function listar(req, res) {
  try {
    const query = `
      SELECT p.id, p.nombre, p.subtitulo_italiano, p.descripcion, 
             p.precio_base, p.foto_url, p.es_popular, p.disponible, p.fecha_creacion,
             c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
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

// 2. READ ONE - Obtener producto por ID (con sus ingredientes asociados)
async function obtenerPorId(req, res, id) {
  try {
    const query = `
      SELECT p.id, p.nombre, p.subtitulo_italiano, p.descripcion, 
             p.precio_base, p.foto_url, p.es_popular, p.disponible, p.categoria_id,
             c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    const resultado = await pool.query(query, [id]);
    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Producto #${id} no encontrado` });
    }

    // Obtener ingredientes de la receta
    const ingQuery = `
      SELECT i.id, i.nombre, i.precio_adicional, i.es_vegetariano, i.es_picante
      FROM producto_ingredientes pi
      JOIN ingredientes i ON pi.ingrediente_id = i.id
      WHERE pi.producto_id = $1
    `;
    const ingRes = await pool.query(ingQuery, [id]);

    const producto = resultado.rows[0];
    producto.ingredientes = ingRes.rows;

    responder(res, 200, { success: true, data: producto });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Insertar un nuevo producto
async function crear(req, res, body) {
  try {
    const { categoria_id, nombre, subtitulo_italiano, descripcion, precio_base, foto_url, es_popular, disponible } = body;
    if (!nombre || !precio_base) {
      return responder(res, 400, { success: false, mensaje: 'nombre y precio_base son obligatorios' });
    }

    const query = `
      INSERT INTO productos (categoria_id, nombre, subtitulo_italiano, descripcion, precio_base, foto_url, es_popular, disponible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const valores = [
      categoria_id || 1,
      nombre,
      subtitulo_italiano || null,
      descripcion || 'Pizza artesanal de autor',
      precio_base,
      foto_url || null,
      es_popular || false,
      disponible !== false
    ];

    const resultado = await pool.query(query, valores);
    responder(res, 201, {
      success: true,
      mensaje: 'Producto creado exitosamente en PostgreSQL',
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 4. UPDATE - Actualizar producto existente
async function actualizar(req, res, id, body) {
  try {
    const { nombre, subtitulo_italiano, descripcion, precio_base, foto_url, es_popular, disponible, categoria_id } = body;
    const query = `
      UPDATE productos 
      SET nombre = COALESCE($1, nombre),
          subtitulo_italiano = COALESCE($2, subtitulo_italiano),
          descripcion = COALESCE($3, descripcion),
          precio_base = COALESCE($4, precio_base),
          foto_url = COALESCE($5, foto_url),
          es_popular = COALESCE($6, es_popular),
          disponible = COALESCE($7, disponible),
          categoria_id = COALESCE($8, categoria_id)
      WHERE id = $9
      RETURNING *
    `;
    const valores = [nombre, subtitulo_italiano, descripcion, precio_base, foto_url, es_popular, disponible, categoria_id, id];
    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Producto #${id} no encontrado para actualizar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Producto #${id} actualizado exitosamente`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 5. DELETE - Eliminar producto
async function eliminar(req, res, id) {
  try {
    const query = `DELETE FROM productos WHERE id = $1 RETURNING id, nombre`;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Producto #${id} no encontrado para eliminar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Producto #${id} (${resultado.rows[0].nombre}) eliminado exitosamente de la base de datos`,
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
