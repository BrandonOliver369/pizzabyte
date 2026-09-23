export interface Usuario {
  username: string;
  nombre: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'CLIENTE_VIP' | 'OPERADOR';
  proveedorAuth?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
  avatarUrl?: string;
}

export interface CredencialesLogin {
  username: string;
  password: string;
  recordar?: boolean;
}

export interface DatosRegistro {
  nombre: string;
  username: string;
  email: string;
  password: string;
  rol?: 'ADMINISTRADOR' | 'CLIENTE_VIP' | 'OPERADOR';
}

export interface RespuestaRegistro {
  success: boolean;
  mensaje: string;
  usuario?: Usuario;
  token?: string;
  hash?: string;
  archivoTxt?: InfoArchivoTxt;
  error?: string;
}

export interface InfoArchivoTxt {
  ruta?: string;
  nombre: string;
  carpeta?: string;
  contenido: string;
  archivosDisponibles?: string[];
}

export interface RespuestaLogin {
  success: boolean;
  mensaje: string;
  token?: string;
  usuario?: Usuario;
  hash?: string;
  archivoTxt?: InfoArchivoTxt;
  vigenciaSegundos?: number;
  expira?: string;
  error?: string;
}

export interface RespuestaVerificacion {
  authenticated: boolean;
  usuario?: Usuario;
  token?: string;
  hash?: string;
  archivoTxt?: InfoArchivoTxt;
  expiresAt?: string;
  mensaje?: string;
}

export interface VerificacionHash {
  valido: boolean;
  username: string;
  hashCalculado: string;
  hashEsperado: string | null;
  rol: string | null;
}
