/**
 * ==============================================================================
 * CONTROLADOR 1: PRODUCTOS (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.productos'
 * Columnas exactas del esquema normalizado 3NF:
 * id, categoria_id, nombre, descripcion, precio_base, imagen_url, disponible, creado_en
 */

const { pool } = require('../db');

function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Obtener todos los productos del catálogo
async function listar(req, res) {
  try {
    const query = `
      SELECT p.id, p.nombre, p.descripcion, p.precio_base, 
             p.imagen_url, p.disponible, p.creado_en, p.categoria_id,
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

// 2. READ ONE - Obtener producto por ID (con su receta e ingredientes)
async function obtenerPorId(req, res, id) {
  try {
    const query = `
      SELECT p.id, p.nombre, p.descripcion, p.precio_base, 
             p.imagen_url, p.disponible, p.creado_en, p.categoria_id,
             c.nombre AS categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `;
    const resultado = await pool.query(query, [id]);
    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Producto #${id} no encontrado` });
    }

    // Obtener ingredientes vinculados en producto_ingredientes
    const ingQuery = `
      SELECT i.id, i.nombre, i.costo_extra, i.stock_disponible, i.unidad_medida,
             pi.es_obligatorio, pi.cantidad_estandar
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

// 3. CREATE - Insertar una nueva pizza/producto
async function crear(req, res, body) {
  try {
    const { categoria_id, nombre, descripcion, precio_base, imagen_url, disponible } = body;
    if (!nombre || precio_base === undefined) {
      return responder(res, 400, { success: false, mensaje: 'nombre y precio_base son obligatorios' });
    }

    const query = `
      INSERT INTO productos (categoria_id, nombre, descripcion, precio_base, imagen_url, disponible)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const valores = [
      categoria_id || 1,
      nombre,
      descripcion || 'Pizza artesanal de autor',
      parseFloat(precio_base),
      imagen_url || null,
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

// 4. UPDATE - Modificar producto existente
async function actualizar(req, res, id, body) {
  try {
    const { nombre, descripcion, precio_base, imagen_url, disponible, categoria_id } = body;
    const query = `
      UPDATE productos 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio_base = COALESCE($3, precio_base),
          imagen_url = COALESCE($4, imagen_url),
          disponible = COALESCE($5, disponible),
          categoria_id = COALESCE($6, categoria_id)
      WHERE id = $7
      RETURNING *
    `;
    const valores = [
      nombre,
      descripcion,
      precio_base !== undefined ? parseFloat(precio_base) : null,
      imagen_url,
      disponible,
      categoria_id,
      id
    ];
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
      mensaje: `Producto #${id} (${resultado.rows[0].nombre}) eliminado exitosamente de PostgreSQL`,
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
