/**
 * Modelo de Dominio para PizzaByte
 * Coincide exactamente con la Entidad Java Pedido.java:
 * - id: Long
 * - saborPizza: String
 * - correoCliente: String
 */
export interface Pedido {
  id?: number;
  saborPizza: string;
  correoCliente: string;
  // Metadatos adicionales para la experiencia de usuario y cocina interna
  fechaCreacion?: string;
  estado?: EstadoPedido;
  precioTotal?: number;
  tamano?: string;
  origen?: 'WEB' | 'TELEFONO' | 'MOSTRADOR';
  clienteNombre?: string;
  direccionEntrega?: string;
  notasCocina?: string;
  tiempoEstimadoMin?: number;
  creadoPor?: string;
  metodoPago?: 'PAYPAL' | 'TARJETA' | 'EFECTIVO';
  idTransaccionPaypal?: string;
  estadoPago?: 'PAGADO' | 'PENDIENTE';
}

export type EstadoPedido = 'CREADO' | 'CONFIRMADO' | 'EN_HORNO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

/**
 * Representación del correo enviado por MailAdapter (SMTP)
 */
export interface NotificacionMail {
  id: string;
  pedidoId?: number;
  destinatario: string;
  asunto: string;
  cuerpo: string;
  saborPizza: string;
  timestamp: string;
  estadoEnvio: 'ENVIADO' | 'PENDIENTE' | 'ERROR';
}

/**
 * Opciones de sabores disponibles en el menú
 */
export interface SaborPizza {
  id: string;
  nombre: string;
  subtituloItaliano?: string;
  descripcion: string;
  ingredientes: string[];
  precio: number;
  imagen: string;
  fotoUrl?: string;
  popular?: boolean;
  vegetariana?: boolean;
  picante?: boolean;
  calorias?: number;
  maridajeRecomendado?: string;
  disponible?: boolean;
}

/**
 * Configuración para el servicio de envío real EmailJS
 */
export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  activo: boolean;
}

/**
 * Registro de eventos internos y auditoría para el administrador
 */
export interface EventoAuditoria {
  id: string;
  timestamp: string;
  pedidoId?: number;
  accion: string;
  detalle: string;
  usuario: string;
  tipo: 'ESTADO' | 'CREACION' | 'CANCELACION' | 'STOCK' | 'PRECIO';
}
