import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import emailjs from '@emailjs/browser';
import { Pedido, NotificacionMail, SaborPizza, EmailJsConfig, EstadoPedido, EventoAuditoria } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);

  // URL del backend Spring Boot configurado en PedidoController
  readonly apiUrl = 'http://localhost:8080/api/pizzas/ordenar';

  // Modo: false = Conectar a Backend real (Brevo SMTP en 8080), true = Simulador
  readonly modoSimulacion = signal<boolean>(false);

  // Estado de los pedidos
  readonly pedidos = signal<Pedido[]>([]);

  // Catálogo modificable con disponibilidad y precios dinámicos
  readonly catalogoPizzasModificable = signal<SaborPizza[]>([]);

  // Registro de eventos de auditoría y operaciones de cocina
  readonly registroAuditoria = signal<EventoAuditoria[]>([]);

  // Historial de correos enviados por MailAdapter (SMTP)
  readonly notificaciones = signal<NotificacionMail[]>([]);

  // Último correo enviado (para mostrar en modal/toast)
  readonly ultimaNotificacion = signal<NotificacionMail | null>(null);

  // Configuración de EmailJS para envío real
  readonly emailJsConfig = signal<EmailJsConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    activo: false
  });

  // Estado del envío real
  readonly estadoEnvioReal = signal<'NO_CONFIGURADO' | 'ENVIANDO' | 'ENVIADO' | 'FALLO'>('NO_CONFIGURADO');
  readonly mensajeEnvioReal = signal<string | null>(null);

  // Estado de carga y error (ahora suave e informativo)
  readonly procesando = signal<boolean>(false);
  readonly mensajeError = signal<string | null>(null);

  // SEGUIMIENTO EN TIEMPO REAL DEL PEDIDO ACTIVO
  readonly etapaSeguimiento = signal<number>(2); // 0: Recibido, 1: Amasando, 2: Al Horno, 3: En Reparto, 4: Entregado
  readonly minutosEstimados = signal<number>(22);
  private trackingTimer: any = null;

  iniciarSeguimientoEnVivo(): void {
    if (this.trackingTimer) {
      clearInterval(this.trackingTimer);
    }
    this.etapaSeguimiento.set(0);
    this.minutosEstimados.set(28);

    let seg = 0;
    this.trackingTimer = setInterval(() => {
      seg++;
      if (seg === 6) {
        this.etapaSeguimiento.set(1);
        this.minutosEstimados.set(22);
      } else if (seg === 16) {
        this.etapaSeguimiento.set(2);
        this.minutosEstimados.set(15);
      } else if (seg === 28) {
        this.etapaSeguimiento.set(3);
        this.minutosEstimados.set(8);
      } else if (seg === 42) {
        this.etapaSeguimiento.set(4);
        this.minutosEstimados.set(0);
        clearInterval(this.trackingTimer);
      }
    }, 1000);
  }

  // Catálogo de pizzas disponibles en PizzaByte
  readonly catalogoPizzas: SaborPizza[] = [
    {
      id: 'pepperoni-byte',
      nombre: 'Pepperoni Clásica Byte',
      subtituloItaliano: 'Salame Piccante & Fior di Latte',
      descripcion: 'Doble porción de salame pepperoni curado a baja temperatura, mozzarella fior di latte fundido y salsa de tomate San Marzano.',
      ingredientes: ['Mozzarella Fior di Latte', 'Doble Pepperoni Curado', 'Tomates San Marzano DOP', 'Orégano Silvestre'],
      precio: 12.99,
      imagen: '🍕',
      fotoUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
      popular: true,
      calorias: 265,
      maridajeRecomendado: 'Chianti Classico o Cerveza IPA Artesanal'
    },
    {
      id: 'cuatro-quesos',
      nombre: 'Cuatro Quesos Kernel',
      subtituloItaliano: 'Quattro Formaggi d’Autore',
      descripcion: 'Sinfonía de quesos madurados: gorgonzola cremoso con vetas azules, parmigiano reggiano 24 meses, fontina alpina y mozzarella.',
      ingredientes: ['Mozzarella Fresco', 'Gorgonzola DOP', 'Parmigiano Reggiano', 'Fontina Valdostana', 'Miel Trufada'],
      precio: 14.50,
      imagen: '🧀',
      fotoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
      popular: true,
      calorias: 290,
      maridajeRecomendado: 'Pinot Grigio o Cerveza Belga Dubbel'
    },
    {
      id: 'bbq-chicken',
      nombre: 'BBQ Chicken Stack',
      subtituloItaliano: 'Pollo Rustico & Bacon Affumicato',
      descripcion: 'Pechuga marinada a la leña, cebolla morada caramelizada con balsámico di Modena, panceta ahumada crujiente y salsa BBQ.',
      ingredientes: ['Pollo a la Parrilla', 'Cebolla Caramelizada al Balsámico', 'Panceta Ahumada', 'Salsa BBQ Ahumada'],
      precio: 15.20,
      imagen: '🍗',
      fotoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      calorias: 275,
      maridajeRecomendado: 'Syrah Robusto o Cerveza Porter Ahumada'
    },
    {
      id: 'hawaiana-special',
      nombre: 'Hawaiana Gourmet Byte',
      subtituloItaliano: 'Prosciutto Cotto & Ananas Caramellato',
      descripcion: 'Jamón prosciutto cotto italiano seleccionado a mano, trozos de piña golden caramelizada a la parrilla y toque sutil de miel silvestre.',
      ingredientes: ['Prosciutto Cotto Premium', 'Piña Golden Glaseada', 'Fior di Latte', 'Hojitas de Menta'],
      precio: 13.50,
      imagen: '🍍',
      fotoUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
      calorias: 245,
      maridajeRecomendado: 'Prosecco Valdobbiadene o Cerveza Wheat Ale'
    },
    {
      id: 'mexicana-byte',
      nombre: 'Mexicana Fuego Byte',
      subtituloItaliano: 'Manzo Piccante & Peperoncino',
      descripcion: 'Carne de res magra especiada con comino tostado, jalapeños encurtidos en casa, pimientos asados al carbón y queso cheddar inglés.',
      ingredientes: ['Carne Especiada al Carbón', 'Jalapeños Escabeche', 'Pimientos Rostizados', 'Cheddar & Mozzarella'],
      precio: 14.99,
      imagen: '🌶️',
      fotoUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop',
      picante: true,
      calorias: 280,
      maridajeRecomendado: 'Cerveza Bock o Mezcal Espadín'
    },
    {
      id: 'veggie-supreme',
      nombre: 'Vegetariana Supreme',
      subtituloItaliano: 'Orto Botanico & Olio al Tartufo',
      descripcion: 'Champiñones cremini silvestres, aceitunas kalamata, tomates cherry confitados, espinacas baby y gotas de aceite de trufa blanca.',
      ingredientes: ['Cremini Silvestres', 'Kalamata Griegas', 'Tomates Confitados', 'Espinacas Baby', 'Aceite de Trufa'],
      precio: 13.90,
      imagen: '🥬',
      fotoUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop',
      vegetariana: true,
      calorias: 210,
      maridajeRecomendado: 'Sauvignon Blanc o San Pellegrino Aranciata'
    }
  ];

  // Clave oficial Brevo API v3
  readonly brevoApiKey = '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';
  readonly brevoSender = 'brandooliver4@gmail.com';

  constructor() {
    this.cargarDesdeLocalStorage();
    this.iniciarSincronizacionEntrePestanas();
  }

  /**
   * Sincroniza en tiempo real los pedidos y cambios de cocina entre diferentes pestañas del navegador
   */
  private iniciarSincronizacionEntrePestanas(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'pizzabyte_pedidos' && event.newValue) {
          try {
            this.pedidos.set(JSON.parse(event.newValue));
          } catch (e) {
            console.warn('Error sincronizando pedidos entre pestañas:', e);
          }
        } else if (event.key === 'pizzabyte_catalogo' && event.newValue) {
          try {
            this.catalogoPizzasModificable.set(JSON.parse(event.newValue));
          } catch (e) {
            console.warn('Error sincronizando catálogo entre pestañas:', e);
          }
        }
      });
    }
  }

  /**
   * Ejecuta la orden de pedido y envía el correo real en automático vía Brevo API v3.
   */
  async ordenarPizza(
    saborPizza: string, 
    correoCliente: string, 
    precioTotal: number = 13.99,
    metodoPago: 'PAYPAL' | 'TARJETA' | 'EFECTIVO' = 'PAYPAL',
    idTransaccionPaypal?: string,
    detallesExtra?: Partial<Pedido>
  ): Promise<Pedido> {
    this.procesando.set(true);
    this.mensajeError.set(null);

    const payload: Pedido = {
      saborPizza,
      correoCliente,
      fechaCreacion: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      estado: 'CONFIRMADO',
      precioTotal,
      metodoPago,
      idTransaccionPaypal: idTransaccionPaypal || (metodoPago === 'PAYPAL' ? 'PAYID-' + Math.random().toString(36).substring(2, 10).toUpperCase() : undefined),
      estadoPago: metodoPago === 'EFECTIVO' ? 'PENDIENTE' : 'PAGADO',
      origen: 'WEB',
      ...detallesExtra
    };

    try {
      let pedidoConfirmado: Pedido;

      if (!this.modoSimulacion()) {
        try {
          const response = await firstValueFrom(
            this.http.post<Pedido>(this.apiUrl, {
              saborPizza: payload.saborPizza,
              correoCliente: payload.correoCliente,
              precioTotal: payload.precioTotal,
              metodoPago: payload.metodoPago,
              idTransaccionPaypal: payload.idTransaccionPaypal,
              estadoPago: payload.estadoPago,
              tamano: payload.tamano,
              origen: payload.origen || 'WEB'
            })
          );
          pedidoConfirmado = {
            ...payload,
            id: response.id || Date.now(),
            saborPizza: response.saborPizza || payload.saborPizza,
            correoCliente: response.correoCliente || payload.correoCliente,
            metodoPago: response.metodoPago || payload.metodoPago,
            idTransaccionPaypal: response.idTransaccionPaypal || payload.idTransaccionPaypal,
            estadoPago: response.estadoPago || payload.estadoPago
          };
        } catch (httpErr) {
          console.warn('Backend local no disponible en 8080, procesando pedido con el cliente:', httpErr);
          pedidoConfirmado = this.simularCasoDeUso(payload);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 400));
        pedidoConfirmado = this.simularCasoDeUso(payload);
      }

      // Guardar en la lista y persistencia
      this.pedidos.update(lista => [pedidoConfirmado, ...lista]);
      this.guardarEnLocalStorage();

      // Disparar la salida visual de MailAdapter (SMTP) en la app
      this.dispararMailAdapter(pedidoConfirmado);

      // 🚀 ENVÍO AUTOMÁTICO REAL VÍA BREVO API V3
      await this.enviarCorreoRealBrevo(pedidoConfirmado);

      return pedidoConfirmado;
    } finally {
      this.procesando.set(false);
    }
  }

  /**
   * Envía un correo real automáticamente a la casilla del cliente usando Brevo API v3
   */
  async enviarCorreoRealBrevo(pedido: Pedido): Promise<boolean> {
    this.estadoEnvioReal.set('ENVIANDO');
    this.mensajeEnvioReal.set('Despachando correo real a ' + pedido.correoCliente + '...');

    const brevoPayload = {
      sender: {
        name: 'PizzaByte 🍕',
        email: this.brevoSender
      },
      to: [
        {
          email: pedido.correoCliente,
          name: 'Cliente PizzaByte'
        }
      ],
      subject: `¡Tu pizza de ${pedido.saborPizza} está en camino! 🍕 - Pedido #${pedido.id}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
          <div style="background: #dc2626; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
            <p style="margin: 6px 0 0; font-size: 15px;">Confirmación de Pedido • Arquitectura Hexagonal</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <h2 style="color: #000000; margin-top: 0;">¡Hola! Tu pedido ha sido confirmado 🎉</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              El caso de uso <strong>CrearPedidoUseCase</strong> procesó tu pedido exitosamente y el adaptador <strong>MailAdapter</strong> despachó este correo vía <strong>Brevo API v3</strong>.
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">
                "Tu pizza de ${pedido.saborPizza} está en camino."
              </p>
              <span style="font-size: 12px; color: #b91c1c;">— Salida de MailAdapter (Brevo API v3)</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Número de Pedido:</td>
                <td style="padding: 10px 14px; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">#${pedido.id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Sabor Seleccionado:</td>
                <td style="padding: 10px 14px; font-weight: bold; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${pedido.saborPizza}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Destinatario:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #dc2626; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">${pedido.correoCliente}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Estado:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #dc2626; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">🔴 CONFIRMADO</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Método de Pago:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #0284c7; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                  ${pedido.metodoPago === 'PAYPAL' ? '🅿️ PayPal (Verificado - ' + (pedido.idTransaccionPaypal || 'ID Registrado') + ')' : (pedido.metodoPago || 'Tarjeta')}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; color: #6b7280; font-size: 14px;">Total Pagado:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #16a34a; font-size: 14px; text-align: right;">
                  \$${(pedido.precioTotal || 13.99).toFixed(2)} (${pedido.estadoPago === 'PAGADO' ? '✅ PAGADO' : '⏳ PENDIENTE'})
                </td>
              </tr>
            </table>
          </div>
          <div style="background: #000000; padding: 14px; text-align: center; color: #9ca3af; font-size: 12px;">
            PizzaByte Hexagonal Architecture Demo • Enviado automáticamente vía Brevo API v3
          </div>
        </div>
      `
    };

    try {
      const resp = await firstValueFrom(
        this.http.post<any>('https://api.brevo.com/v3/smtp/email', brevoPayload, {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );
      console.log('✅ [MailAdapter / Brevo API] ¡Correo real enviado exitosamente en automático!', resp);
      this.estadoEnvioReal.set('ENVIADO');
      this.mensajeEnvioReal.set(`¡Correo real enviado automáticamente a ${pedido.correoCliente}!`);
      return true;
    } catch (err: any) {
      console.error('⚠️ [MailAdapter / Brevo API] Error al enviar correo:', err);
      this.estadoEnvioReal.set('FALLO');
      this.mensajeEnvioReal.set('Error enviando correo por Brevo API');
      return false;
    }
  }

  /**
   * Envía un correo electrónico real usando EmailJS
   */
  async enviarCorreoRealEmailJS(pedido: Pedido): Promise<boolean> {
    const config = this.emailJsConfig();
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      this.estadoEnvioReal.set('NO_CONFIGURADO');
      return false;
    }

    this.estadoEnvioReal.set('ENVIANDO');
    this.mensajeEnvioReal.set('Enviando correo real a ' + pedido.correoCliente + '...');

    try {
      const templateParams = {
        to_email: pedido.correoCliente,
        cliente_email: pedido.correoCliente,
        sabor_pizza: pedido.saborPizza,
        pedido_id: pedido.id,
        precio_total: pedido.precioTotal,
        message: `Tu pizza de ${pedido.saborPizza} está en camino. Pedido #${pedido.id}`
      };

      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );

      this.estadoEnvioReal.set('ENVIADO');
      this.mensajeEnvioReal.set(`¡Correo real enviado con éxito a ${pedido.correoCliente}!`);
      return true;
    } catch (err: any) {
      console.error('Error al enviar correo con EmailJS:', err);
      this.estadoEnvioReal.set('FALLO');
      this.mensajeEnvioReal.set('No se pudo enviar por EmailJS: ' + (err?.text || err?.message || 'Error de conexión'));
      return false;
    }
  }

  /**
   * Genera el enlace directo para enviar el correo desde Gmail Web en 1 clic
   */
  obtenerUrlGmailWeb(pedido: Pedido): string {
    const to = encodeURIComponent(pedido.correoCliente);
    const su = encodeURIComponent(`¡Tu pizza de ${pedido.saborPizza} está en camino! 🍕 - PizzaByte #${pedido.id}`);
    const body = encodeURIComponent(
      `¡Hola!\n\n` +
      `Tu pedido en PizzaByte ha sido recibido y confirmado a través de nuestra Arquitectura Hexagonal:\n\n` +
      `• Especialidad: ${pedido.saborPizza}\n` +
      `• Número de Pedido: #${pedido.id}\n` +
      `• Total: $${(pedido.precioTotal || 13.99).toFixed(2)}\n` +
      `• Estado: En preparación / Horno\n\n` +
      `Mensaje despachado por MailAdapter (SMTP): "Tu pizza de ${pedido.saborPizza} está en camino."\n\n` +
      `¡Muchas gracias por tu preferencia!\nPizzaByte Team`
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
  }

  /**
   * Genera el enlace mailto: estándar para abrir la app de correo predeterminada (Outlook, Windows Mail, Thunderbird, etc.)
   */
  obtenerUrlMailto(pedido: Pedido): string {
    const to = encodeURIComponent(pedido.correoCliente);
    const su = encodeURIComponent(`Confirmación PizzaByte: Pedido #${pedido.id} (${pedido.saborPizza})`);
    const body = encodeURIComponent(
      `Hola,\n\nTu pedido de pizza ${pedido.saborPizza} (#${pedido.id}) está en camino.\n\nMensaje de MailAdapter: Tu pizza de ${pedido.saborPizza} está en camino.`
    );
    return `mailto:${to}?subject=${su}&body=${body}`;
  }

  guardarConfigEmailJs(config: EmailJsConfig): void {
    this.emailJsConfig.set(config);
    try {
      localStorage.setItem('pizzabyte_emailjs', JSON.stringify(config));
    } catch (e) {
      console.error('Error guardando configuración EmailJS:', e);
    }
  }

  private simularCasoDeUso(pedido: Pedido): Pedido {
    const nuevoId = Math.floor(1000 + Math.random() * 9000);
    return {
      ...pedido,
      id: nuevoId,
      estado: 'CONFIRMADO',
      fechaCreacion: new Date().toLocaleDateString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      })
    };
  }

  private dispararMailAdapter(pedido: Pedido): void {
    const cuerpo = `Tu pizza de ${pedido.saborPizza} está en camino.`;
    const asunto = `¡Tu pedido #${pedido.id} está en camino! 🍕 - PizzaByte`;

    console.log(`[MailAdapter / SMTP] Enviando correo SMTP a: ${pedido.correoCliente}`);
    console.log(`[MailAdapter / SMTP] Mensaje: ${cuerpo}`);

    const notificacion: NotificacionMail = {
      id: 'MAIL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      pedidoId: pedido.id,
      destinatario: pedido.correoCliente,
      asunto,
      cuerpo,
      saborPizza: pedido.saborPizza,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      estadoEnvio: 'ENVIADO'
    };

    this.notificaciones.update(n => [notificacion, ...n]);
    this.ultimaNotificacion.set(notificacion);
  }

  cerrarModalNotificacion(): void {
    this.ultimaNotificacion.set(null);
  }

  toggleModoSimulacion(): void {
    this.modoSimulacion.update(val => !val);
  }

  limpiarHistorial(): void {
    this.pedidos.set([]);
    this.notificaciones.set([]);
    this.ultimaNotificacion.set(null);
    localStorage.removeItem('pizzabyte_pedidos');
    localStorage.removeItem('pizzabyte_notificaciones');
    localStorage.removeItem('pizzabyte_auditoria');
  }

  /**
   * Actualiza el estado de una orden en la cocina o despacho (KDS)
   */
  async actualizarEstadoPedido(
    id: number, 
    nuevoEstado: EstadoPedido, 
    usuarioOperador: string = 'Administrador', 
    notificarCliente: boolean = true
  ): Promise<boolean> {
    const pedidoActual = this.pedidos().find(p => p.id === id);
    if (!pedidoActual) return false;

    const estadoAnterior = pedidoActual.estado;
    const pedidoActualizado: Pedido = {
      ...pedidoActual,
      estado: nuevoEstado
    };

    // Actualizar lista en señal
    this.pedidos.update(lista => lista.map(p => p.id === id ? pedidoActualizado : p));

    // Sincronizar seguimiento de la app si es el pedido activo
    if (nuevoEstado === 'CREADO' || nuevoEstado === 'CONFIRMADO') {
      this.etapaSeguimiento.set(1);
    } else if (nuevoEstado === 'EN_HORNO') {
      this.etapaSeguimiento.set(2);
      this.minutosEstimados.set(15);
    } else if (nuevoEstado === 'EN_CAMINO') {
      this.etapaSeguimiento.set(3);
      this.minutosEstimados.set(8);
    } else if (nuevoEstado === 'ENTREGADO') {
      this.etapaSeguimiento.set(4);
      this.minutosEstimados.set(0);
    }

    // Registrar en auditoría
    this.registrarEventoAuditoria({
      pedidoId: id,
      accion: `Cambio de Estado`,
      detalle: `Orden #${id} pasó de [${estadoAnterior}] a [${nuevoEstado}]`,
      usuario: usuarioOperador,
      tipo: 'ESTADO'
    });

    this.guardarEnLocalStorage();

    // Notificar al cliente si tiene correo válido
    if (notificarCliente && pedidoActual.correoCliente) {
      await this.enviarNotificacionCambioEstadoBrevo(pedidoActualizado, nuevoEstado);
    }

    // Llamada opcional al backend en 8080 si está disponible
    try {
      await firstValueFrom(
        this.http.patch(`http://localhost:8080/api/pizzas/pedidos/${id}/estado`, {
          estado: nuevoEstado,
          usuario: usuarioOperador
        })
      );
    } catch (e) {
      // Backend opcional o en modo cliente
    }

    return true;
  }

  /**
   * Elimina o cancela una orden del sistema
   */
  eliminarPedido(id: number, usuarioOperador: string = 'Administrador'): void {
    const pedido = this.pedidos().find(p => p.id === id);
    if (pedido) {
      this.pedidos.update(lista => lista.filter(p => p.id !== id));
      this.registrarEventoAuditoria({
        pedidoId: id,
        accion: 'Cancelación / Eliminación',
        detalle: `Orden #${id} (${pedido.saborPizza}) eliminada del sistema`,
        usuario: usuarioOperador,
        tipo: 'CANCELACION'
      });
      this.guardarEnLocalStorage();
    }
  }

  /**
   * Crea un nuevo pedido manual (telefónico o presencial en mostrador)
   */
  crearPedidoManual(datos: Partial<Pedido>, usuarioOperador: string = 'Administrador'): Pedido {
    const nuevoId = Math.floor(2000 + Math.random() * 8000);
    const nuevoPedido: Pedido = {
      id: nuevoId,
      saborPizza: datos.saborPizza || 'Pepperoni Clásica Byte',
      correoCliente: datos.correoCliente || 'mostrador@pizzabyte.com',
      clienteNombre: datos.clienteNombre || 'Cliente en Mostrador',
      origen: datos.origen || 'MOSTRADOR',
      notasCocina: datos.notasCocina || '',
      direccionEntrega: datos.direccionEntrega || 'Retiro en Sucursal Central',
      precioTotal: datos.precioTotal || 13.99,
      tamano: datos.tamano || 'Grande Familiar',
      estado: 'CONFIRMADO',
      fechaCreacion: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      creadoPor: usuarioOperador
    };

    this.pedidos.update(lista => [nuevoPedido, ...lista]);
    this.registrarEventoAuditoria({
      pedidoId: nuevoId,
      accion: 'Nuevo Pedido Manual',
      detalle: `Orden #${nuevoId} (${nuevoPedido.saborPizza}) tomada vía ${nuevoPedido.origen} por ${usuarioOperador}`,
      usuario: usuarioOperador,
      tipo: 'CREACION'
    });

    this.guardarEnLocalStorage();
    return nuevoPedido;
  }

  /**
   * Alterna la disponibilidad de una pizza en el menú (Stock / Agotado)
   */
  alternarDisponibilidadPizza(pizzaId: string, usuarioOperador: string = 'Administrador'): void {
    this.catalogoPizzasModificable.update(lista =>
      lista.map(pizza => {
        if (pizza.id === pizzaId) {
          const nuevaDisp = pizza.disponible === false ? true : false;
          this.registrarEventoAuditoria({
            accion: 'Ajuste de Disponibilidad',
            detalle: `Pizza "${pizza.nombre}" marcada como ${nuevaDisp ? 'DISPONIBLE' : 'AGOTADA'}`,
            usuario: usuarioOperador,
            tipo: 'STOCK'
          });
          return { ...pizza, disponible: nuevaDisp };
        }
        return pizza;
      })
    );
    this.guardarEnLocalStorage();
  }

  /**
   * Actualiza el precio base de una pizza
   */
  actualizarPrecioPizza(pizzaId: string, nuevoPrecio: number, usuarioOperador: string = 'Administrador'): void {
    this.catalogoPizzasModificable.update(lista =>
      lista.map(pizza => {
        if (pizza.id === pizzaId) {
          this.registrarEventoAuditoria({
            accion: 'Ajuste de Precio',
            detalle: `Precio de "${pizza.nombre}" actualizado de $${pizza.precio} a $${nuevoPrecio.toFixed(2)}`,
            usuario: usuarioOperador,
            tipo: 'PRECIO'
          });
          return { ...pizza, precio: nuevoPrecio };
        }
        return pizza;
      })
    );
    this.guardarEnLocalStorage();
  }

  /**
   * Registra un evento en el log de auditoría
   */
  registrarEventoAuditoria(evento: Omit<EventoAuditoria, 'id' | 'timestamp'>): void {
    const nuevoEvento: EventoAuditoria = {
      id: 'EVT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...evento
    };
    this.registroAuditoria.update(lista => [nuevoEvento, ...lista.slice(0, 49)]);
  }

  /**
   * Envía notificación de actualización de estado por Brevo API v3
   */
  async enviarNotificacionCambioEstadoBrevo(pedido: Pedido, nuevoEstado: EstadoPedido): Promise<boolean> {
    let asuntoEstado = '';
    let mensajeEstado = '';
    let emojiEstado = '🍕';

    switch (nuevoEstado) {
      case 'EN_HORNO':
        asuntoEstado = `🔥 ¡Tu pizza está en el horno de leña a 400°C! - Pedido #${pedido.id}`;
        mensajeEstado = `Tu pizza de ${pedido.saborPizza} ya está en nuestro horno de leña napolitano a 400°C. La masa madre se está dorando a la perfección.`;
        emojiEstado = '🔥';
        break;
      case 'EN_CAMINO':
        asuntoEstado = `🛵 ¡Tu pizza va en camino con el repartidor! - Pedido #${pedido.id}`;
        mensajeEstado = `¡Buenas noticias! Nuestro repartidor express acaba de salir con tu pizza de ${pedido.saborPizza} en caja térmica sellada. Prepárate para recibirla.`;
        emojiEstado = '🛵';
        break;
      case 'ENTREGADO':
        asuntoEstado = `✅ ¡Tu orden ha sido entregada! - Pedido #${pedido.id}`;
        mensajeEstado = `¡Tu orden #${pedido.id} ha sido entregada! Esperamos que disfrutes cada rebanada. ¡Buen provecho y gracias por elegir PizzaByte!`;
        emojiEstado = '🎉';
        break;
      case 'CANCELADO':
        asuntoEstado = `⚠️ Orden #${pedido.id} cancelada - PizzaByte`;
        mensajeEstado = `Tu orden #${pedido.id} ha sido cancelada. Si necesitas asistencia, contáctanos al concierge (555) 890-BYTE.`;
        emojiEstado = '⚠️';
        break;
      default:
        return false;
    }

    const notificacion: NotificacionMail = {
      id: 'MAIL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      pedidoId: pedido.id,
      destinatario: pedido.correoCliente,
      asunto: asuntoEstado,
      cuerpo: mensajeEstado,
      saborPizza: pedido.saborPizza,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      estadoEnvio: 'ENVIADO'
    };

    this.notificaciones.update(n => [notificacion, ...n]);
    this.ultimaNotificacion.set(notificacion);

    const brevoPayload = {
      sender: { name: 'PizzaByte Cocina & Despacho', email: this.brevoSender },
      to: [{ email: pedido.correoCliente, name: pedido.clienteNombre || 'Cliente PizzaByte' }],
      subject: asuntoEstado,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #dc2626;">
          <div style="background: linear-gradient(135deg, #000000 0%, #1f0505 100%); padding: 24px; text-align: center; border-bottom: 2px solid #dc2626;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">PIZZA<span style="color: #ef4444;">BYTE</span></h1>
            <p style="color: #f87171; font-size: 13px; margin: 4px 0 0;">ACTUALIZACIÓN DE TU ORDEN EN TIEMPO REAL</p>
          </div>
          <div style="padding: 24px; background: #121212;">
            <div style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid #ef4444; padding: 14px; border-radius: 6px; margin-bottom: 18px;">
              <span style="font-size: 24px;">${emojiEstado}</span>
              <strong style="color: #ef4444; font-size: 16px; margin-left: 8px;">${nuevoEstado}</strong>
              <p style="color: #f1f5f9; margin: 8px 0 0; font-size: 14px; line-height: 1.5;">${mensajeEstado}</p>
            </div>
            <p style="color: #94a3b8; font-size: 13px;"><strong>Número de Orden:</strong> #${pedido.id} | <strong>Sabor:</strong> ${pedido.saborPizza}</p>
          </div>
          <div style="background: #000000; padding: 12px; text-align: center; color: #64748b; font-size: 11px;">
            PizzaByte Kitchen Display System • Actualización automática
          </div>
        </div>
      `
    };

    try {
      await firstValueFrom(
        this.http.post<any>('https://api.brevo.com/v3/smtp/email', brevoPayload, {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );
      return true;
    } catch (e) {
      console.warn('[MailAdapter / Estado] No se pudo enviar por Brevo:', e);
      return false;
    }
  }

  private guardarEnLocalStorage(): void {
    try {
      localStorage.setItem('pizzabyte_pedidos', JSON.stringify(this.pedidos()));
      localStorage.setItem('pizzabyte_notificaciones', JSON.stringify(this.notificaciones()));
      localStorage.setItem('pizzabyte_auditoria', JSON.stringify(this.registroAuditoria()));
      localStorage.setItem('pizzabyte_catalogo', JSON.stringify(this.catalogoPizzasModificable()));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  private cargarDesdeLocalStorage(): void {
    try {
      const pedidosGuardados = localStorage.getItem('pizzabyte_pedidos');
      const notificacionesGuardadas = localStorage.getItem('pizzabyte_notificaciones');
      const emailJsGuardado = localStorage.getItem('pizzabyte_emailjs');
      const auditoriaGuardada = localStorage.getItem('pizzabyte_auditoria');
      const catalogoGuardado = localStorage.getItem('pizzabyte_catalogo');

      if (emailJsGuardado) {
        this.emailJsConfig.set(JSON.parse(emailJsGuardado));
      }

      if (catalogoGuardado) {
        this.catalogoPizzasModificable.set(JSON.parse(catalogoGuardado));
      } else {
        this.catalogoPizzasModificable.set(this.catalogoPizzas.map(p => ({ ...p, disponible: true })));
      }

      if (auditoriaGuardada) {
        this.registroAuditoria.set(JSON.parse(auditoriaGuardada));
      } else {
        this.registroAuditoria.set([
          {
            id: 'EVT-INIT',
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            accion: 'Inicio de Sistema',
            detalle: 'KDS y Panel de Cocina inicializado con 4 estaciones',
            usuario: 'Sistema',
            tipo: 'ESTADO'
          }
        ]);
      }

      if (pedidosGuardados) {
        this.pedidos.set(JSON.parse(pedidosGuardados));
      } else {
        const ejemplos: Pedido[] = [
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
        this.pedidos.set(ejemplos);
      }

      if (notificacionesGuardadas) {
        this.notificaciones.set(JSON.parse(notificacionesGuardadas));
      }
    } catch (e) {
      console.warn('No se pudo cargar desde localStorage:', e);
    }
  }
}
