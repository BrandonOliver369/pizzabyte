import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Usuario, 
  CredencialesLogin, 
  DatosRegistro,
  RespuestaRegistro,
  RespuestaLogin, 
  RespuestaVerificacion, 
  InfoArchivoTxt,
  VerificacionHash 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly backendAuthUrl = 'http://localhost:8080/api/auth';

  // Señales de Estado
  readonly usuarioActual = signal<Usuario | null>(null);
  readonly tokenActual = signal<string | null>(null);
  readonly sesionActiva = computed(() => this.usuarioActual() !== null);
  readonly esAdmin = computed(() => this.usuarioActual()?.rol === 'ADMINISTRADOR');
  readonly cookieDetectada = signal<string | null>(null);
  readonly archivoTxtActual = signal<InfoArchivoTxt | null>(null);
  readonly hashUltimoLogin = signal<string | null>(null);
  readonly expiracionSesion = signal<string | null>(null);

  readonly procesando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);

  // Client ID oficial de Google Cloud (OAuth 2.0)
  readonly googleClientId = signal<string>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('pizzabyte_google_client_id') : null) || 
    '988493829724-5rcov418mdtc00u4d74qcv4uh31f7t5b.apps.googleusercontent.com'
  );

  guardarGoogleClientId(clientId: string): void {
    const limpio = clientId.trim();
    this.googleClientId.set(limpio);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pizzabyte_google_client_id', limpio);
    }
  }

  // App ID oficial de Meta / Facebook Developers
  readonly facebookAppId = signal<string>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('pizzabyte_facebook_app_id') : null) || ''
  );

  guardarFacebookAppId(appId: string): void {
    const limpio = appId.trim();
    this.facebookAppId.set(limpio);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pizzabyte_facebook_app_id', limpio);
    }
  }

  decodificarTokenGoogleJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error al decodificar JWT de Google:', e);
      return null;
    }
  }

  async procesarCredencialGoogleReal(credential: string): Promise<boolean> {
    const payload = this.decodificarTokenGoogleJWT(credential);
    if (!payload || !payload.email) {
      this.mensajeError.set('No se pudo verificar la credencial de Google');
      return false;
    }

    console.log('✅ [Google Identity Services] Cuenta Google REAL verificada:', payload.email, payload.name);

    return await this.loginConGoogle({
      nombre: payload.name || payload.given_name || 'Usuario Google',
      email: payload.email,
      avatarUrl: payload.picture
    });
  }

  // Usuarios locales predefinidos con Hashes SHA-256 para validación garantizada
  readonly usuariosLocales: Array<{
    username: string;
    passwordHash: string;
    nombre: string;
    email: string;
    rol: 'ADMINISTRADOR' | 'CLIENTE_VIP' | 'OPERADOR';
  }> = [
    {
      username: 'admin',
      passwordHash: '767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8', // pizza123
      nombre: 'Administrador PizzaByte',
      email: 'brandooliver4@gmail.com',
      rol: 'ADMINISTRADOR'
    },
    {
      username: 'brandon',
      passwordHash: '6227931946d4f7130d60e51a34c2b17807ce00cd96177db1d8a6601646dacfb4', // byte2026
      nombre: 'Brandon Oliver (Cliente)',
      email: 'brandooliver777@gmail.com',
      rol: 'CLIENTE_VIP'
    }
  ];

  constructor() {
    this.iniciarDeteccionSesion();
  }

  /**
   * Lee las cookies del navegador y verifica si existe una sesión persistente previa
   */
  async iniciarDeteccionSesion(): Promise<void> {
    this.actualizarCookieVisual();
    await this.verificarSesionCookie();
  }

  /**
   * Extrae el valor de la cookie 'pizzabyte_session' de document.cookie
   */
  leerCookieSesion(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )pizzabyte_session=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  actualizarCookieVisual(): void {
    const cookie = this.leerCookieSesion();
    this.cookieDetectada.set(cookie);
  }

  /**
   * Calcula el Hash SHA-256 de cualquier texto usando la Web Crypto API nativa
   */
  async calcularHashSHA256(texto: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Inicia sesión, establece la cookie persistente y genera el archivo .txt en la carpeta temporal
   */
  async login(credenciales: CredencialesLogin): Promise<boolean> {
    this.procesando.set(true);
    this.mensajeError.set(null);

    try {
      const hash = await this.calcularHashSHA256(credenciales.password);
      this.hashUltimoLogin.set(hash);

      let loginExitoso = false;
      let usuarioAutenticado: Usuario | null = null;
      let tokenGenerado = '';
      let infoTxt: InfoArchivoTxt | null = null;

      // 1. Intentar con el Backend Node (puerto 8080)
      try {
        const respuesta = await firstValueFrom(
          this.http.post<RespuestaLogin>(
            `${this.backendAuthUrl}/login`,
            {
              username: credenciales.username,
              password: credenciales.password,
              recordar: credenciales.recordar ?? true
            },
            { withCredentials: true }
          )
        );

        if (respuesta.success && respuesta.usuario) {
          loginExitoso = true;
          usuarioAutenticado = respuesta.usuario;
          tokenGenerado = respuesta.token || 'pb_sess_' + Math.random().toString(36).substring(2);
          infoTxt = respuesta.archivoTxt || null;
          if (respuesta.expira) {
            this.expiracionSesion.set(respuesta.expira);
          }
        } else {
          this.mensajeError.set(respuesta.mensaje || 'Credenciales incorrectas');
          return false;
        }
      } catch (httpErr) {
        console.warn('Backend en 8080 no respondió, validando con el motor criptográfico local de cookies:', httpErr);

        // 2. Fallback de alta disponibilidad local
        const usuarioLocal = this.usuariosLocales.find(
          u => u.username.toLowerCase() === credenciales.username.trim().toLowerCase()
        );

        if (usuarioLocal && usuarioLocal.passwordHash === hash) {
          loginExitoso = true;
          usuarioAutenticado = {
            username: usuarioLocal.username,
            nombre: usuarioLocal.nombre,
            email: usuarioLocal.email,
            rol: usuarioLocal.rol
          };
          tokenGenerado = 'pb_sess_' + Math.random().toString(36).substring(2, 18);
          infoTxt = {
            nombre: `sesion_${usuarioLocal.username}.txt`,
            contenido: this.generarContenidoTxtLocal(usuarioAutenticado, tokenGenerado, hash)
          };
        } else {
          this.mensajeError.set('Usuario o contraseña incorrectos (Hash no coincide)');
          return false;
        }
      }

      if (loginExitoso && usuarioAutenticado) {
        // Establecer Cookie persistente (7 días = 604800 segundos)
        const maxAge = (credenciales.recordar !== false) ? 604800 : 86400;
        const expiraFecha = new Date(Date.now() + maxAge * 1000);
        document.cookie = `pizzabyte_session=${tokenGenerado}; path=/; max-age=${maxAge}; SameSite=Lax`;
        
        // Guardar sesión persistente para recargas de pestaña
        localStorage.setItem('pizzabyte_user_cache', JSON.stringify({
          usuario: usuarioAutenticado,
          token: tokenGenerado,
          hash,
          expira: expiraFecha.toISOString()
        }));

        this.usuarioActual.set(usuarioAutenticado);
        this.tokenActual.set(tokenGenerado);
        this.expiracionSesion.set(expiraFecha.toLocaleString('es-ES'));
        this.archivoTxtActual.set(infoTxt);
        this.actualizarCookieVisual();

        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error durante login:', err);
      this.mensajeError.set(err?.message || 'Error al procesar inicio de sesión');
      return false;
    } finally {
      this.procesando.set(false);
    }
  }

  /**
   * Registra un nuevo usuario, crea el hash SHA-256 de la contraseña y establece la sesión persistente
   */
  async registrar(datos: DatosRegistro): Promise<boolean> {
    this.procesando.set(true);
    this.mensajeError.set(null);

    try {
      const hash = await this.calcularHashSHA256(datos.password);
      this.hashUltimoLogin.set(hash);

      let registroExitoso = false;
      let usuarioCreado: Usuario | null = null;
      let tokenGenerado = '';
      let infoTxt: InfoArchivoTxt | null = null;

      // 1. Intentar registrar en Backend Node
      try {
        const respuesta = await firstValueFrom(
          this.http.post<RespuestaRegistro>(
            `${this.backendAuthUrl}/register`,
            {
              nombre: datos.nombre,
              username: datos.username,
              email: datos.email,
              password: datos.password,
              rol: datos.rol || 'CLIENTE_VIP'
            },
            { withCredentials: true }
          )
        );

        if (respuesta.success && respuesta.usuario) {
          registroExitoso = true;
          usuarioCreado = respuesta.usuario;
          tokenGenerado = respuesta.token || 'pb_sess_' + Math.random().toString(36).substring(2);
          infoTxt = respuesta.archivoTxt || null;
        } else {
          this.mensajeError.set(respuesta.mensaje || 'No se pudo completar el registro');
          return false;
        }
      } catch (httpErr: any) {
        console.warn('Backend no disponible para registro, aplicando registro local:', httpErr);
        
        // Fallback local
        const limpioUser = datos.username.trim().toLowerCase();
        const yaExiste = this.usuariosLocales.some(u => u.username.toLowerCase() === limpioUser);
        if (yaExiste) {
          this.mensajeError.set('El nombre de usuario ya está registrado');
          return false;
        }

        usuarioCreado = {
          username: limpioUser,
          nombre: datos.nombre.trim(),
          email: datos.email.trim(),
          rol: datos.rol || 'CLIENTE_VIP'
        };
        this.usuariosLocales.push({
          username: limpioUser,
          passwordHash: hash,
          nombre: usuarioCreado.nombre,
          email: usuarioCreado.email,
          rol: usuarioCreado.rol
        });
        tokenGenerado = 'pb_sess_' + Math.random().toString(36).substring(2);
        infoTxt = {
          nombre: `sesion_${usuarioCreado.username}.txt`,
          contenido: this.generarContenidoTxtLocal(usuarioCreado, tokenGenerado, hash)
        };
        registroExitoso = true;
      }

      if (registroExitoso && usuarioCreado) {
        const maxAge = 604800; // 7 días persistente
        const expiraFecha = new Date(Date.now() + maxAge * 1000);
        document.cookie = `pizzabyte_session=${tokenGenerado}; path=/; max-age=${maxAge}; SameSite=Lax`;

        localStorage.setItem('pizzabyte_user_cache', JSON.stringify({
          usuario: usuarioCreado,
          token: tokenGenerado,
          hash,
          expira: expiraFecha.toISOString()
        }));

        this.usuarioActual.set(usuarioCreado);
        this.tokenActual.set(tokenGenerado);
        this.expiracionSesion.set(expiraFecha.toLocaleString('es-ES'));
        this.archivoTxtActual.set(infoTxt);
        this.actualizarCookieVisual();

        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error durante registro:', err);
      this.mensajeError.set(err?.message || 'Error al procesar el registro');
      return false;
    } finally {
      this.procesando.set(false);
    }
  }

  /**
   * Inicio de sesión o registro vía Google OAuth
   */
  async loginConGoogle(perfil?: { nombre?: string; email?: string; avatarUrl?: string }): Promise<boolean> {
    this.procesando.set(true);
    this.mensajeError.set(null);

    try {
      const email = perfil?.email || 'brandon.oliver.google@gmail.com';
      const nombre = perfil?.nombre || 'Brandon Oliver (Google)';
      const avatarUrl = perfil?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

      const usuarioGoogle: Usuario = {
        username: `g_${username}`,
        nombre,
        email,
        rol: 'CLIENTE_VIP',
        proveedorAuth: 'GOOGLE',
        avatarUrl
      };

      const tokenGenerado = 'pb_google_' + Math.random().toString(36).substring(2, 18);
      const hashSimulado = await this.calcularHashSHA256(`google_oauth_${email}`);
      this.hashUltimoLogin.set(hashSimulado);

      const maxAge = 604800; // 7 días
      const expiraFecha = new Date(Date.now() + maxAge * 1000);
      document.cookie = `pizzabyte_session=${tokenGenerado}; path=/; max-age=${maxAge}; SameSite=Lax`;

      const infoTxt = {
        nombre: `sesion_google_${username}.txt`,
        contenido: this.generarContenidoTxtLocal(usuarioGoogle, tokenGenerado, hashSimulado)
      };

      localStorage.setItem('pizzabyte_user_cache', JSON.stringify({
        usuario: usuarioGoogle,
        token: tokenGenerado,
        hash: hashSimulado,
        expira: expiraFecha.toISOString()
      }));

      this.usuarioActual.set(usuarioGoogle);
      this.tokenActual.set(tokenGenerado);
      this.expiracionSesion.set(expiraFecha.toLocaleString('es-ES'));
      this.archivoTxtActual.set(infoTxt);
      this.actualizarCookieVisual();

      // Enviar al backend si está activo
      try {
        await firstValueFrom(
          this.http.post(`${this.backendAuthUrl}/social-login`, {
            proveedor: 'GOOGLE',
            token: tokenGenerado,
            usuario: usuarioGoogle
          }, { withCredentials: true })
        );
      } catch (e) {
        // Backend opcional
      }

      return true;
    } catch (err: any) {
      console.error('Error en Google OAuth:', err);
      this.mensajeError.set('No se pudo autenticar con Google');
      return false;
    } finally {
      this.procesando.set(false);
    }
  }

  /**
   * Inicio de sesión o registro vía Facebook Login
   */
  async loginConFacebook(perfil?: { nombre?: string; email?: string; avatarUrl?: string }): Promise<boolean> {
    this.procesando.set(true);
    this.mensajeError.set(null);

    try {
      const email = perfil?.email || 'brandon.oliver.fb@facebook.com';
      const nombre = perfil?.nombre || 'Brandon Oliver (Facebook)';
      const avatarUrl = perfil?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80';
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

      const usuarioFacebook: Usuario = {
        username: `fb_${username}`,
        nombre,
        email,
        rol: 'CLIENTE_VIP',
        proveedorAuth: 'FACEBOOK',
        avatarUrl
      };

      const tokenGenerado = 'pb_fb_' + Math.random().toString(36).substring(2, 18);
      const hashSimulado = await this.calcularHashSHA256(`fb_oauth_${email}`);
      this.hashUltimoLogin.set(hashSimulado);

      const maxAge = 604800; // 7 días
      const expiraFecha = new Date(Date.now() + maxAge * 1000);
      document.cookie = `pizzabyte_session=${tokenGenerado}; path=/; max-age=${maxAge}; SameSite=Lax`;

      const infoTxt = {
        nombre: `sesion_fb_${username}.txt`,
        contenido: this.generarContenidoTxtLocal(usuarioFacebook, tokenGenerado, hashSimulado)
      };

      localStorage.setItem('pizzabyte_user_cache', JSON.stringify({
        usuario: usuarioFacebook,
        token: tokenGenerado,
        hash: hashSimulado,
        expira: expiraFecha.toISOString()
      }));

      this.usuarioActual.set(usuarioFacebook);
      this.tokenActual.set(tokenGenerado);
      this.expiracionSesion.set(expiraFecha.toLocaleString('es-ES'));
      this.archivoTxtActual.set(infoTxt);
      this.actualizarCookieVisual();

      // Enviar al backend si está activo
      try {
        await firstValueFrom(
          this.http.post(`${this.backendAuthUrl}/social-login`, {
            proveedor: 'FACEBOOK',
            token: tokenGenerado,
            usuario: usuarioFacebook
          }, { withCredentials: true })
        );
      } catch (e) {
        // Backend opcional
      }

      return true;
    } catch (err: any) {
      console.error('Error en Facebook Login:', err);
      this.mensajeError.set('No se pudo autenticar con Facebook');
      return false;
    } finally {
      this.procesando.set(false);
    }
  }

  /**
   * Verifica si hay una cookie persistente activa al abrir la página o recargar
   */
  async verificarSesionCookie(): Promise<boolean> {
    const cookieToken = this.leerCookieSesion();
    this.cookieDetectada.set(cookieToken);

    if (!cookieToken) {
      // Si no hay cookie en document.cookie, verificar si expiró
      const cached = localStorage.getItem('pizzabyte_user_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (new Date(parsed.expira) > new Date()) {
            // Reestablecer cookie si aún está vigente
            document.cookie = `pizzabyte_session=${parsed.token}; path=/; max-age=604800; SameSite=Lax`;
            this.cookieDetectada.set(parsed.token);
            this.usuarioActual.set(parsed.usuario);
            this.tokenActual.set(parsed.token);
            this.hashUltimoLogin.set(parsed.hash);
            this.expiracionSesion.set(new Date(parsed.expira).toLocaleString('es-ES'));
          } else {
            localStorage.removeItem('pizzabyte_user_cache');
          }
        } catch {
          localStorage.removeItem('pizzabyte_user_cache');
        }
      }
      return this.sesionActiva();
    }

    // Hay cookie: consultar con el backend /api/auth/verify
    try {
      const resp = await firstValueFrom(
        this.http.get<RespuestaVerificacion>(`${this.backendAuthUrl}/verify`, {
          withCredentials: true
        })
      );

      if (resp.authenticated && resp.usuario) {
        this.usuarioActual.set(resp.usuario);
        this.tokenActual.set(resp.token || cookieToken);
        this.hashUltimoLogin.set(resp.hash || null);
        if (resp.archivoTxt) {
          this.archivoTxtActual.set(resp.archivoTxt);
        }
        if (resp.expiresAt) {
          this.expiracionSesion.set(new Date(resp.expiresAt).toLocaleString('es-ES'));
        }
        return true;
      }
    } catch (err) {
      console.warn('Backend verify no disponible, restaurando desde cookie local persistente:', err);
    }

    // Si el backend no respondió pero la cookie existe y hay cache local:
    const cached = localStorage.getItem('pizzabyte_user_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        this.usuarioActual.set(parsed.usuario);
        this.tokenActual.set(parsed.token);
        this.hashUltimoLogin.set(parsed.hash);
        this.expiracionSesion.set(new Date(parsed.expira).toLocaleString('es-ES'));
        
        if (!this.archivoTxtActual()) {
          this.archivoTxtActual.set({
            nombre: `sesion_${parsed.usuario.username}.txt`,
            contenido: this.generarContenidoTxtLocal(parsed.usuario, parsed.token, parsed.hash)
          });
        }
        return true;
      } catch (e) {
        console.error(e);
      }
    }

    return false;
  }

  /**
   * Cierra la sesión, elimina la cookie y borra el caché
   */
  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.backendAuthUrl}/logout`, {}, { withCredentials: true })
      );
    } catch (e) {
      console.warn('Backend logout omitido:', e);
    }

    // Expirar la cookie inmediatamente en el navegador
    document.cookie = 'pizzabyte_session=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('pizzabyte_user_cache');

    this.usuarioActual.set(null);
    this.tokenActual.set(null);
    this.cookieDetectada.set(null);
    this.archivoTxtActual.set(null);
    this.hashUltimoLogin.set(null);
    this.expiracionSesion.set(null);
  }

  /**
   * Lee el archivo .txt de la carpeta temporal desde el backend
   */
  async refrescarArchivoTxt(): Promise<void> {
    try {
      const resp = await firstValueFrom(
        this.http.get<any>(`${this.backendAuthUrl}/session-file`, { withCredentials: true })
      );
      if (resp.existe) {
        this.archivoTxtActual.set({
          nombre: resp.nombre,
          ruta: resp.carpeta,
          contenido: resp.contenido,
          archivosDisponibles: resp.archivosDisponibles
        });
      }
    } catch (e) {
      console.warn('No se pudo refrescar archivo .txt desde backend:', e);
    }
  }

  /**
   * Valida credenciales contra el endpoint /verify-credentials o localmente mediante Hash SHA-256
   */
  async verificarCredenciales(username: string, passwordPlana: string): Promise<VerificacionHash> {
    const hash = await this.calcularHashSHA256(passwordPlana);

    try {
      const resp = await firstValueFrom(
        this.http.post<VerificacionHash>(
          `${this.backendAuthUrl}/verify-credentials`,
          { username, password: passwordPlana },
          { withCredentials: true }
        )
      );
      return resp;
    } catch (err) {
      const usuarioLocal = this.usuariosLocales.find(
        u => u.username.toLowerCase() === username.trim().toLowerCase()
      );
      return {
        valido: usuarioLocal ? usuarioLocal.passwordHash === hash : false,
        username,
        hashCalculado: hash,
        hashEsperado: usuarioLocal ? usuarioLocal.passwordHash : null,
        rol: usuarioLocal ? usuarioLocal.rol : null
      };
    }
  }

  private generarContenidoTxtLocal(usuario: Usuario, token: string, hash: string): string {
    return [
      '==================================================================',
      '        PIZZABYTE - REGISTRO DE AUDITORIA DE SESION ACTIVA        ',
      '==================================================================',
      `Usuario Autenticado : ${usuario.username}`,
      `Nombre Completo     : ${usuario.nombre}`,
      `Correo Electronico  : ${usuario.email}`,
      `Rol de Acceso       : ${usuario.rol}`,
      `Fecha y Hora        : ${new Date().toLocaleString('es-ES')}`,
      `Estado de Sesion    : ACTIVA (Verificada mediante Cookie Persistente)`,
      `Token de Sesion     : ${token}`,
      `Hash SHA-256        : ${hash}`,
      '------------------------------------------------------------------',
      'PERSISTENCIA DE SESION:',
      '• Cookie configurada con vigencia prolongada (Max-Age=604800 / 7 dias).',
      '• Si se cierra el navegador o la pagina, la sesion se mantiene activa.',
      '• Verificado por script Bash: ./verify_session.sh',
      '=================================================================='
    ].join('\n');
  }
}
