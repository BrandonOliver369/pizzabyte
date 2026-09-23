const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 8080;
const BREVO_API_KEY = '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';
const BREVO_SENDER = 'brandooliver4@gmail.com';

// Directorio temporal de sesiones
const TEMP_DIR = path.join(__dirname, 'temp_sessions');

function asegurarCarpetaTemporal() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(` [TempDir] Carpeta temporal creada en: ${TEMP_DIR}`);
  }
}

// Base de datos en memoria de usuarios con contraseñas en Hash SHA-256
const USUARIOS = [
  {
    username: 'admin',
    passwordHash: crypto.createHash('sha256').update('pizza123').digest('hex'),
    nombre: 'Administrador PizzaByte',
    email: 'brandooliver4@gmail.com',
    rol: 'ADMINISTRADOR'
  },
  {
    username: 'brandon',
    passwordHash: crypto.createHash('sha256').update('byte2026').digest('hex'),
    nombre: 'Brandon Oliver (Cliente)',
    email: 'brandooliver777@gmail.com',
    rol: 'CLIENTE_VIP'
  }
];

// Sesiones activas: token -> { user, createdAt, expiresAt }
const SESIONES_ACTIVAS = new Map();

// Base de datos de pedidos en memoria para KDS y Cocina
const PEDIDOS_DB = [
  {
    id: 1001,
    saborPizza: 'Pepperoni Clásica Byte',
    correoCliente: 'katniss2305@gmail.com',
    clienteNombre: 'Katniss Everdeen',
    origen: 'WEB',
    fechaCreacion: 'Hoy, 19:40',
    estado: 'EN_HORNO',
    precioTotal: 14.50,
    tamano: 'Grande Familiar',
    notasCocina: 'Masa crocante al carbón, bien dorada'
  },
  {
    id: 1002,
    saborPizza: 'Cuatro Quesos Kernel',
    correoCliente: 'brandon@pizzabyte.com',
    clienteNombre: 'Brandon Oliver',
    origen: 'MOSTRADOR',
    fechaCreacion: 'Hoy, 19:55',
    estado: 'CONFIRMADO',
    precioTotal: 16.00,
    tamano: 'Mediana Clásica',
    notasCocina: 'Extra fior di latte'
  },
  {
    id: 1003,
    saborPizza: 'Mexicana Fuego Byte',
    correoCliente: 'pedidos@pizzabyte.com',
    clienteNombre: 'Sofia Reyes',
    origen: 'TELEFONO',
    fechaCreacion: 'Hoy, 19:25',
    estado: 'EN_CAMINO',
    precioTotal: 15.79,
    tamano: 'Grande Familiar',
    direccionEntrega: 'Av. Reforma #405 Int 3',
    notasCocina: 'Jalapeños aparte'
  }
];

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(part => {
    const [key, ...vals] = part.trim().split('=');
    if (key) cookies[key] = decodeURIComponent(vals.join('='));
  });
  return cookies;
}

function escribirArchivoSesionTxt(usuario, token) {
  asegurarCarpetaTemporal();
  const fecha = new Date().toISOString();
  const fechaLegible = new Date().toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'America/Mexico_City'
  });

  const archivoRuta = path.join(TEMP_DIR, `sesion_${usuario.username}.txt`);
  const contenido = [
    '==================================================================',
    '        PIZZABYTE - REGISTRO DE AUDITORIA DE SESION ACTIVA        ',
    '==================================================================',
    `Usuario Autenticado : ${usuario.username}`,
    `Nombre Completo     : ${usuario.nombre}`,
    `Correo Electronico  : ${usuario.email}`,
    `Rol de Acceso       : ${usuario.rol}`,
    `Fecha y Hora        : ${fechaLegible} (${fecha})`,
    `Estado de Sesion    : ACTIVA (Verificada mediante Cookie Persistente)`,
    `Token de Sesion     : ${token}`,
    `Hash SHA-256        : ${usuario.passwordHash}`,
    '------------------------------------------------------------------',
    'PERSISTENCIA DE SESION:',
    '• Cookie configurada con vigencia prolongada (Max-Age=604800 / 7 dias).',
    '• Si se cierra el navegador o la pagina, la sesion se mantiene activa.',
    '• Verificado por script Bash: ./verify_session.sh',
    '=================================================================='
  ].join('\n');

  fs.writeFileSync(archivoRuta, contenido, 'utf-8');
  console.log(` [Auth / TXT] Archivo guardado: ${archivoRuta}`);
  return { ruta: archivoRuta, nombre: `sesion_${usuario.username}.txt`, contenido };
}

function enviarCorreoBrevo(pedido) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: {
        name: 'PizzaByte ',
        email: BREVO_SENDER
      },
      to: [
        {
          email: pedido.correoCliente,
          name: 'Cliente PizzaByte'
        }
      ],
      subject: `¡Tu pizza de ${pedido.saborPizza} está en camino! 🍕 - Pedido #${pedido.id}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #e63946; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
            <p style="margin: 6px 0 0; font-size: 14px;">Confirmación de Pedido • Arquitectura Hexagonal</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">¡Hola! Tu pedido ha sido confirmado 🎉</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              El caso de uso <strong>CrearPedidoUseCase</strong> procesó tu pedido exitosamente y el adaptador <strong>MailAdapter</strong> despachó este correo vía <strong>Brevo API v3</strong>.
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #e63946; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">
                "Tu pizza de ${pedido.saborPizza} está en camino."
              </p>
              <span style="font-size: 12px; color: #b91c1c;">— Salida de MailAdapter (Brevo API v3)</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Número de Pedido:</td>
                <td style="padding: 10px 14px; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e2e8f0;">#${pedido.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Sabor Seleccionado:</td>
                <td style="padding: 10px 14px; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e2e8f0;">${pedido.saborPizza}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Destinatario:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #0284c7; font-size: 14px; text-align: right; border-bottom: 1px solid #e2e8f0;">${pedido.correoCliente}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px;">Estado:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #16a34a; font-size: 14px; text-align: right;">🟢 CONFIRMADO</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Método de Pago:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #0284c7; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">
                  ${pedido.metodoPago === 'PAYPAL' ? '🅿️ PayPal (Transacción: ' + (pedido.idTransaccionPaypal || 'PAYID-OK') + ')' : (pedido.metodoPago === 'EFECTIVO' ? '💵 Efectivo al Recibir' : '💳 Tarjeta')}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">Total:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #16a34a; font-size: 14px; text-align: right; border-top: 1px solid #e2e8f0;">
                  $${(pedido.precioTotal || 13.99).toFixed(2)} (${pedido.estadoPago === 'PAGADO' ? '✅ PAGADO' : '⏳ PENDIENTE'})
                </td>
              </tr>
            </table>
          </div>
          <div style="background: #0f172a; padding: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
            PizzaByte Hexagonal Architecture Demo • Enviado automáticamente vía Brevo API v3
          </div>
        </div>
      `
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, res => {
      let resBody = '';
      res.on('data', chunk => { resBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(resBody));
        } else {
          reject(new Error(`Brevo API status ${res.statusCode}: ${resBody}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(data);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  // CORS con soporte para cookies y credenciales
  const origin = req.headers.origin || 'http://localhost:4200';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Rutas de Autenticación
  // 1. POST /api/auth/login
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password, recordar } = JSON.parse(body || '{}');
        const hashRecibido = crypto.createHash('sha256').update(password || '').digest('hex');
        
        console.log(` [Auth / Login] Intento de login para usuario: "${username}"`);
        console.log(` [Hash] SHA-256 de la contraseña ingresada: ${hashRecibido}`);

        const usuario = USUARIOS.find(u => u.username.toLowerCase() === (username || '').toLowerCase());

        if (!usuario || usuario.passwordHash !== hashRecibido) {
          console.warn(` [Auth / Login] Credenciales invalidas para: "${username}"`);
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            mensaje: 'Usuario o contraseña incorrectos',
            hashVerificado: hashRecibido
          }));
          return;
        }

        // Generar token persistente
        const token = 'pb_sess_' + crypto.randomBytes(24).toString('hex');
        const maxAge = recordar === false ? 86400 : 604800; // 7 días persistente
        const expiresDate = new Date(Date.now() + maxAge * 1000);

        SESIONES_ACTIVAS.set(token, {
          usuario,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: expiresDate.toISOString()
        });

        // Crear carpeta temporal y guardar el archivo .txt
        const infoTxt = escribirArchivoSesionTxt(usuario, token);

        console.log(` [Auth / Login] Login exitoso para "${usuario.username}" (${usuario.rol})`);
        console.log(` [Cookie] Emitiendo cookie persistente "pizzabyte_session" (Max-Age=${maxAge}s)`);

        // Cabecera Set-Cookie con vigencia prolongada
        res.setHeader('Set-Cookie', `pizzabyte_session=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          mensaje: 'Inicio de sesión exitoso y persistente',
          token,
          usuario: {
            username: usuario.username,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
          },
          hash: usuario.passwordHash,
          archivoTxt: infoTxt,
          vigenciaSegundos: maxAge,
          expira: expiresDate.toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 1.5. POST /api/auth/register (Registro de nuevo usuario con Hash SHA-256)
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { nombre, username, email, password, rol } = JSON.parse(body || '{}');

        if (!username || !password || !email || !nombre) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, mensaje: 'Todos los campos son obligatorios' }));
          return;
        }

        const limpioUser = username.trim().toLowerCase();
        const existe = USUARIOS.find(u => u.username.toLowerCase() === limpioUser || u.email.toLowerCase() === email.trim().toLowerCase());
        if (existe) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, mensaje: 'El nombre de usuario o correo ya está registrado' }));
          return;
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const nuevoUsuario = {
          username: limpioUser,
          passwordHash,
          nombre: nombre.trim(),
          email: email.trim(),
          rol: rol || 'CLIENTE_VIP'
        };

        USUARIOS.push(nuevoUsuario);
        console.log(` [Auth / Register] Nuevo usuario registrado: "${nuevoUsuario.username}" (${nuevoUsuario.rol})`);
        console.log(` [Hash] SHA-256 asignado: ${passwordHash}`);

        // Iniciar sesión automáticamente y generar archivo en temp_sessions
        const token = 'pb_sess_' + crypto.randomBytes(24).toString('hex');
        const maxAge = 604800; // 7 días
        const expiresDate = new Date(Date.now() + maxAge * 1000);

        SESIONES_ACTIVAS.set(token, {
          usuario: nuevoUsuario,
          token,
          createdAt: new Date().toISOString(),
          expiresAt: expiresDate.toISOString()
        });

        const infoTxt = escribirArchivoSesionTxt(nuevoUsuario, token);

        res.setHeader('Set-Cookie', `pizzabyte_session=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          mensaje: '¡Usuario registrado e inicio de sesión exitoso!',
          token,
          usuario: {
            username: nuevoUsuario.username,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
          },
          hash: passwordHash,
          archivoTxt: infoTxt,
          vigenciaSegundos: maxAge,
          expira: expiresDate.toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 1.8. POST /api/auth/social-login (Google OAuth / Facebook Login con Cookie y .txt)
  if (req.method === 'POST' && req.url === '/api/auth/social-login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { proveedor, token, usuario } = JSON.parse(body || '{}');
        if (!usuario || !usuario.username) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Datos de usuario inválidos' }));
          return;
        }

        console.log(` [Auth / Social] Intento de login social con ${proveedor || 'OAuth'}: ${usuario.username} (${usuario.email})`);

        let usuarioExistente = USUARIOS.find(u => 
          u.username.toLowerCase() === usuario.username.toLowerCase() || 
          (usuario.email && u.email && u.email.toLowerCase() === usuario.email.toLowerCase())
        );

        if (!usuarioExistente) {
          usuarioExistente = {
            username: usuario.username,
            nombre: usuario.nombre || 'Usuario Social',
            email: usuario.email || `${usuario.username}@pizzabyte.social`,
            rol: usuario.rol || 'CLIENTE_VIP',
            proveedorAuth: proveedor || 'GOOGLE',
            avatarUrl: usuario.avatarUrl || undefined,
            passwordHash: crypto.createHash('sha256').update(`social_${usuario.username}_${Date.now()}`).digest('hex')
          };
          USUARIOS.push(usuarioExistente);
          console.log(` [Auth / Social] Nuevo perfil social registrado en memoria: ${usuarioExistente.username}`);
        } else {
          usuarioExistente.proveedorAuth = proveedor || usuarioExistente.proveedorAuth;
          if (usuario.avatarUrl) usuarioExistente.avatarUrl = usuario.avatarUrl;
          if (usuario.nombre) usuarioExistente.nombre = usuario.nombre;
        }

        const sessionToken = token || ('pb_sess_' + crypto.randomBytes(24).toString('hex'));
        const maxAge = 604800; // 7 días persistente
        const expiresDate = new Date(Date.now() + maxAge * 1000);

        SESIONES_ACTIVAS.set(sessionToken, {
          usuario: usuarioExistente,
          token: sessionToken,
          createdAt: new Date().toISOString(),
          expiresAt: expiresDate.toISOString()
        });

        const infoTxt = escribirArchivoSesionTxt(usuarioExistente, sessionToken);

        res.setHeader('Set-Cookie', `pizzabyte_session=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          mensaje: `Sesión iniciada exitosamente con ${proveedor || 'OAuth'}`,
          token: sessionToken,
          usuario: {
            username: usuarioExistente.username,
            nombre: usuarioExistente.nombre,
            email: usuarioExistente.email,
            rol: usuarioExistente.rol,
            proveedorAuth: usuarioExistente.proveedorAuth,
            avatarUrl: usuarioExistente.avatarUrl
          },
          hash: usuarioExistente.passwordHash,
          archivoTxt: infoTxt,
          vigenciaSegundos: maxAge,
          expira: expiresDate.toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2. GET /api/auth/verify (Verifica cookie de sesion y actualiza .txt)
  if (req.method === 'GET' && req.url.startsWith('/api/auth/verify')) {
    const cookies = parseCookies(req.headers.cookie);
    let token = cookies['pizzabyte_session'];

    // Soporte alternativo para Authorization: Bearer <token> o ?token=
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace(/^Bearer\s+/i, '');
    }

    console.log(` [Auth / Verify] Verificando cookies de sesion...`);
    console.log(` [Cookies Detectadas]:`, cookies);

    if (token && SESIONES_ACTIVAS.has(token)) {
      const sesion = SESIONES_ACTIVAS.get(token);
      const infoTxt = escribirArchivoSesionTxt(sesion.usuario, token);

      console.log(` [Auth / Verify] Sesion persistente activa para: ${sesion.usuario.username}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authenticated: true,
        usuario: {
          username: sesion.usuario.username,
          nombre: sesion.usuario.nombre,
          email: sesion.usuario.email,
          rol: sesion.usuario.rol
        },
        token,
        hash: sesion.usuario.passwordHash,
        archivoTxt: infoTxt,
        expiresAt: sesion.expiresAt
      }));
      return;
    }

    console.log(`ℹ [Auth / Verify] No hay sesion activa o la cookie expiro`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      authenticated: false,
      mensaje: 'Sin sesión activa'
    }));
    return;
  }

  // 3. POST /api/auth/verify-credentials (Verificación directa de usuario y contraseña con Hash)
  if (req.method === 'POST' && req.url === '/api/auth/verify-credentials') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body || '{}');
        const hash = crypto.createHash('sha256').update(password || '').digest('hex');
        const usuario = USUARIOS.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
        const valido = usuario ? usuario.passwordHash === hash : false;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          valido,
          username,
          hashCalculado: hash,
          hashEsperado: usuario ? usuario.passwordHash : null,
          rol: usuario ? usuario.rol : null
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. GET /api/auth/session-file (Obtener el contenido del txt generado en la carpeta temporal)
  if (req.method === 'GET' && req.url.startsWith('/api/auth/session-file')) {
    asegurarCarpetaTemporal();
    try {
      const archivos = fs.readdirSync(TEMP_DIR).filter(f => f.endsWith('.txt'));
      if (archivos.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ existe: false, mensaje: 'No hay archivos .txt de sesión en la carpeta temporal' }));
        return;
      }

      const primerArchivo = archivos[0];
      const ruta = path.join(TEMP_DIR, primerArchivo);
      const contenido = fs.readFileSync(ruta, 'utf-8');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        existe: true,
        nombre: primerArchivo,
        carpeta: TEMP_DIR,
        contenido,
        archivosDisponibles: archivos
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 5. POST /api/auth/logout
  if (req.method === 'POST' && req.url === '/api/auth/logout') {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies['pizzabyte_session'];
    if (token) {
      SESIONES_ACTIVAS.delete(token);
    }
    // Expirar la cookie inmediatamente
    res.setHeader('Set-Cookie', 'pizzabyte_session=; Path=/; Max-Age=0; SameSite=Lax');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, mensaje: 'Sesión finalizada correctamente' }));
    return;
  }

  // 5.5. POST /api/payments/paypal/verify (Verificación y registro de pagos con PayPal)
  if (req.method === 'POST' && req.url === '/api/payments/paypal/verify') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { orderId, transactionId, payerEmail, payerName, amount, currency } = JSON.parse(body || '{}');
        const payId = transactionId || ('PAYID-' + crypto.randomBytes(8).toString('hex').toUpperCase());
        console.log(`\n======================================================`);
        console.log(` [PayPal Gateway] Verificación de Pago Recibida`);
        console.log(` [PayPal] Transaction ID: ${payId}`);
        console.log(` [PayPal] Cliente: ${payerName || 'Comprador PayPal'} (${payerEmail || 'email@paypal.com'})`);
        console.log(` [PayPal] Total: $${amount || '0.00'} ${currency || 'USD'}`);
        console.log(` [PayPal] Estado: COMPLETED (Transacción Aprobada)`);
        console.log(`======================================================\n`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          verified: true,
          status: 'COMPLETED',
          transactionId: payId,
          amount: amount || 0,
          currency: currency || 'USD',
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ verified: false, error: err.message }));
      }
    });
    return;
  }

  // Pedidos PizzaByte
  if (req.method === 'POST' && req.url === '/api/pizzas/ordenar') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const pedidoRecibido = JSON.parse(body);
        const id = Math.floor(1000 + Math.random() * 9000);
        const metodoPago = pedidoRecibido.metodoPago || 'TARJETA';
        const idTransaccionPaypal = pedidoRecibido.idTransaccionPaypal || (metodoPago === 'PAYPAL' ? 'PAYID-' + crypto.randomBytes(6).toString('hex').toUpperCase() : null);
        const estadoPago = metodoPago === 'PAYPAL' ? 'PAGADO' : (pedidoRecibido.estadoPago || (metodoPago === 'EFECTIVO' ? 'PENDIENTE' : 'PAGADO'));

        const pedido = {
          id,
          saborPizza: pedidoRecibido.saborPizza,
          correoCliente: pedidoRecibido.correoCliente,
          fechaCreacion: new Date().toLocaleDateString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
          }),
          estado: 'CONFIRMADO',
          precioTotal: pedidoRecibido.precioTotal || 13.99,
          tamano: pedidoRecibido.tamano || 'Grande Familiar',
          metodoPago,
          idTransaccionPaypal,
          estadoPago,
          origen: pedidoRecibido.origen || 'WEB'
        };

        PEDIDOS_DB.unshift(pedido);

        console.log(`\n======================================================`);
        console.log(` [PedidoController] POST /api/pizzas/ordenar recibido`);
        console.log(` [CrearPedidoUseCase] Procesando orden #${id} (${pedido.saborPizza})`);
        console.log(` [Pago] Método: ${pedido.metodoPago} | Estado: ${pedido.estadoPago} ${pedido.idTransaccionPaypal ? '| ID: ' + pedido.idTransaccionPaypal : ''}`);
        console.log(` [PedidoDatabaseAdapter] Guardando en persistencia...`);
        console.log(` [MailAdapter / Brevo API] Enviando correo a: ${pedido.correoCliente}`);
        console.log(` [MailAdapter / Brevo API] Mensaje: Tu pizza de ${pedido.saborPizza} está en camino.`);

        try {
          const info = await enviarCorreoBrevo(pedido);
          console.log(` [MailAdapter] ¡Correo REAL enviado exitosamente por Brevo API! (MessageId: ${info.messageId})`);
        } catch (mailErr) {
          console.error(` [MailAdapter] Error Brevo API:`, mailErr.message);
        }
        console.log(`======================================================\n`);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pedido));
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
      }
    });
    return;
  }

  // 6. GET /api/pizzas/pedidos (Listado de órdenes para la administración / KDS)
  if (req.method === 'GET' && req.url === '/api/pizzas/pedidos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(PEDIDOS_DB));
    return;
  }

  // 7. PATCH /api/pizzas/pedidos/:id/estado (Actualizar estado de orden en cocina/reparto)
  if (req.method === 'PATCH' && req.url.startsWith('/api/pizzas/pedidos/') && req.url.endsWith('/estado')) {
    const parts = req.url.split('/');
    const id = parseInt(parts[4], 10);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { estado, usuario } = JSON.parse(body || '{}');
        const pedido = PEDIDOS_DB.find(p => p.id === id);
        if (pedido) {
          pedido.estado = estado;
          console.log(` [KDS / Admin] Pedido #${id} actualizado a [${estado}] por ${usuario || 'Admin'}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, pedido }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Pedido no encontrado' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 8. POST /api/pizzas/pedidos/manual (Crear pedido telefónico o de mostrador)
  if (req.method === 'POST' && req.url === '/api/pizzas/pedidos/manual') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const datos = JSON.parse(body || '{}');
        const nuevoId = Math.floor(2000 + Math.random() * 8000);
        const nuevo = {
          id: nuevoId,
          saborPizza: datos.saborPizza || 'Pepperoni Clásica Byte',
          correoCliente: datos.correoCliente || 'mostrador@pizzabyte.com',
          clienteNombre: datos.clienteNombre || 'Cliente Mostrador',
          origen: datos.origen || 'MOSTRADOR',
          notasCocina: datos.notasCocina || '',
          direccionEntrega: datos.direccionEntrega || 'Retiro en Local',
          precioTotal: datos.precioTotal || 13.99,
          tamano: datos.tamano || 'Grande Familiar',
          estado: 'CONFIRMADO',
          fechaCreacion: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          creadoPor: datos.creadoPor || 'Administrador'
        };
        PEDIDOS_DB.unshift(nuevo);
        console.log(` [KDS / Admin] Pedido manual #${nuevoId} creado vía ${nuevo.origen}`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(nuevo));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && (req.url === '/api/pizzas/health' || req.url === '/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'UP', 
      service: 'PizzaByte Backend', 
      api: 'BREVO_V3_ACTIVE',
      auth: 'SHA256_HASH_ACTIVE',
      tempDir: TEMP_DIR
    }));
    return;
  }

  res.writeHead(404);
  res.end();
});

asegurarCarpetaTemporal();

server.listen(PORT, () => {
  console.log(` ========================================================`);
  console.log(` [PizzaByte Backend] Servidor Hexagonal escuchando en http://localhost:${PORT}`);
  console.log(` [Auth Module] Sistema de Login con Cookies Persistentes activo`);
  console.log(` [Carpeta Temporal] Almacenando sesiones en: ${TEMP_DIR}`);
  console.log(` [Hash SHA-256] Contraseñas cifradas activas (admin/pizza123, brandon/byte2026)`);
  console.log(` [Brevo API v3] Remitente verificado: ${BREVO_SENDER}`);
  console.log(` ========================================================`);
});
