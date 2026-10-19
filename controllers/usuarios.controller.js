/**
 * ==============================================================================
 * CONTROLADOR 5: USUARIOS (CRUD)
 * ==============================================================================
 * Operaciones CRUD completas sobre la tabla 'pizzabyte_core.usuarios'
 */

const crypto = require('crypto');
const { pool } = require('../db');

function responder(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// 1. READ ALL - Listar usuarios (sin exponer contraseñas)
async function listar(req, res) {
  try {
    const query = `
      SELECT u.id, u.username, u.email, u.nombre_completo, u.telefono,
             r.codigo AS rol_codigo, r.nombre AS rol_nombre,
             u.proveedor_auth, u.activo, u.fecha_creacion
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
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

// 2. READ ONE - Obtener usuario por ID
async function obtenerPorId(req, res, id) {
  try {
    const query = `
      SELECT u.id, u.username, u.email, u.nombre_completo, u.telefono,
             r.codigo AS rol_codigo, r.nombre AS rol_nombre,
             u.proveedor_auth, u.avatar_url, u.activo, u.fecha_creacion
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1
    `;
    const resultado = await pool.query(query, [id]);
    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Usuario #${id} no encontrado` });
    }
    responder(res, 200, { success: true, data: resultado.rows[0] });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 3. CREATE - Registrar nuevo usuario
async function crear(req, res, body) {
  try {
    const { username, email, password, nombre_completo, telefono, rol_codigo } = body;
    if (!username || !email || !password) {
      return responder(res, 400, { success: false, mensaje: 'username, email y password son obligatorios' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const rolRes = await pool.query('SELECT id FROM roles WHERE codigo = $1 LIMIT 1', [rol_codigo || 'CLIENTE_VIP']);
    const rolId = rolRes.rows[0] ? rolRes.rows[0].id : 2;

    const query = `
      INSERT INTO usuarios (username, email, password_hash, nombre_completo, telefono, rol_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, nombre_completo, telefono, rol_id, fecha_creacion
    `;
    const valores = [
      username.toLowerCase().trim(),
      email.toLowerCase().trim(),
      hash,
      nombre_completo || username,
      telefono || null,
      rolId
    ];

    const resultado = await pool.query(query, valores);
    responder(res, 201, {
      success: true,
      mensaje: 'Usuario creado exitosamente en PostgreSQL',
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 4. UPDATE - Actualizar datos del usuario
async function actualizar(req, res, id, body) {
  try {
    const { nombre_completo, telefono, password, activo } = body;
    let newHash = null;
    if (password) {
      newHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    const query = `
      UPDATE usuarios
      SET nombre_completo = COALESCE($1, nombre_completo),
          telefono = COALESCE($2, telefono),
          password_hash = COALESCE($3, password_hash),
          activo = COALESCE($4, activo),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, email, nombre_completo, telefono, activo, fecha_actualizacion
    `;
    const resultado = await pool.query(query, [nombre_completo, telefono, newHash, activo, id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Usuario #${id} no encontrado para actualizar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Usuario #${id} actualizado exitosamente`,
      data: resultado.rows[0]
    });
  } catch (err) {
    responder(res, 500, { success: false, error: err.message });
  }
}

// 5. DELETE - Desactivar o eliminar usuario
async function eliminar(req, res, id) {
  try {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id, username`;
    const resultado = await pool.query(query, [id]);

    if (resultado.rows.length === 0) {
      return responder(res, 404, { success: false, mensaje: `Usuario #${id} no encontrado para eliminar` });
    }

    responder(res, 200, {
      success: true,
      mensaje: `Usuario #${id} (${resultado.rows[0].username}) eliminado exitosamente de PostgreSQL`,
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
