import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PayPalRenderOptions {
  saborPizza: string;
  precioTotal: number;
  correoCliente: string;
  onAprobado: (detalles: {
    transactionId: string;
    payerEmail: string;
    payerName: string;
    orderData: any;
  }) => Promise<void> | void;
  onError: (error: any) => void;
  onCancel?: (data: any) => void;
}

export interface RespuestaVerificacionPaypal {
  verified: boolean;
  status: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private readonly http = inject(HttpClient);

  // Client ID oficial de PayPal (Sandbox o Live)
  readonly paypalClientId = signal<string>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('pizzabyte_paypal_client_id') : null) ||
    'BAAbmV1w6KuUqtf9YbEAvv_TY95yCiSDfdMEKhHryr6ID-Yzt2mm_M1JLgTVOuCdU4npH3lvYkTybYjd5s'
  );

  readonly sdkListo = signal<boolean>(false);
  readonly cargandoSdk = signal<boolean>(false);
  readonly errorSdk = signal<string | null>(null);

  constructor() {
    this.verificarOInicializarSdk();
  }

  guardarClientId(nuevoClientId: string): void {
    const limpio = nuevoClientId.trim();
    if (!limpio) return;
    this.paypalClientId.set(limpio);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pizzabyte_paypal_client_id', limpio);
    }
    this.cargarSdk(true);
  }

  verificarOInicializarSdk(): void {
    if (typeof window === 'undefined') return;
    if ((window as any).paypal?.Buttons) {
      this.sdkListo.set(true);
      return;
    }
    this.cargarSdk(false);
  }

  cargarSdk(forzarRecarga = false): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);

    if (!forzarRecarga && (window as any).paypal?.Buttons) {
      this.sdkListo.set(true);
      return Promise.resolve(true);
    }

    this.cargandoSdk.set(true);
    this.errorSdk.set(null);

    return new Promise((resolve) => {
      // Eliminar script previo si existe y forzar recarga
      const scriptExistente = document.getElementById('paypal-sdk-script');
      if (scriptExistente && forzarRecarga) {
        scriptExistente.remove();
        delete (window as any).paypal;
      }

      if (document.getElementById('paypal-sdk-script') && !forzarRecarga) {
        // Ya está insertado, esperar a que window.paypal esté disponible
        let intentos = 0;
        const interval = setInterval(() => {
          intentos++;
          if ((window as any).paypal?.Buttons) {
            clearInterval(interval);
            this.sdkListo.set(true);
            this.cargandoSdk.set(false);
            resolve(true);
          } else if (intentos > 40) { // 8 segundos timeout
            clearInterval(interval);
            this.cargandoSdk.set(false);
            this.errorSdk.set('Timeout esperando carga de PayPal SDK');
            resolve(false);
          }
        }, 200);
        return;
      }

      const script = document.createElement('script');
      script.id = 'paypal-sdk-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(this.paypalClientId())}&currency=USD&components=buttons&enable-funding=venmo,paylater`;
      script.async = true;

      script.onload = () => {
        let intentos = 0;
        const interval = setInterval(() => {
          intentos++;
          if ((window as any).paypal?.Buttons) {
            clearInterval(interval);
            this.sdkListo.set(true);
            this.cargandoSdk.set(false);
            console.log(' [PayPal] SDK oficial cargado y listo con Client ID:', this.paypalClientId().substring(0, 12) + '...');
            resolve(true);
          } else if (intentos > 25) {
            clearInterval(interval);
            this.cargandoSdk.set(false);
            resolve(false);
          }
        }, 150);
      };

      script.onerror = (err) => {
        console.error('Error al cargar PayPal SDK:', err);
        this.errorSdk.set('No se pudo conectar con los servidores de PayPal.');
        this.cargandoSdk.set(false);
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  async renderizarBotonesPayPal(containerId: string, options: PayPalRenderOptions): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Contenedor #${containerId} no encontrado en el DOM`);
      return false;
    }

    container.innerHTML = '';

    const listo = await this.cargarSdk();
    if (!listo || !(window as any).paypal?.Buttons) {
      console.error('PayPal SDK no disponible para renderizar');
      return false;
    }

    try {
      const buttons = (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 44,
          tagline: false
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              description: `PizzaByte Gourmet - ${options.saborPizza}`,
              amount: {
                currency_code: 'USD',
                value: options.precioTotal.toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            console.log(' [PayPal] Orden Aprobada por el comprador. Capturando fondos...');
            const orderData = await actions.order.capture();
            const transactionId = orderData.id || data.orderID || ('PAYID-' + Date.now());
            const payerEmail = orderData.payer?.email_address || options.correoCliente;
            const payerName = [
              orderData.payer?.name?.given_name,
              orderData.payer?.name?.surname
            ].filter(Boolean).join(' ') || 'Comprador PayPal';

            console.log(` [PayPal] Pago Capturado Exitosamente | Transacción: ${transactionId}`);

            // Verificar con backend PizzaByte
            await this.verificarConBackend({
              orderId: data.orderID,
              transactionId,
              payerEmail,
              payerName,
              amount: options.precioTotal,
              currency: 'USD'
            });

            await options.onAprobado({
              transactionId,
              payerEmail,
              payerName,
              orderData
            });
          } catch (captureErr) {
            console.error('Error al capturar fondos de PayPal:', captureErr);
            options.onError(captureErr);
          }
        },
        onError: (err: any) => {
          console.error(' [PayPal] Error en flujo de pago:', err);
          options.onError(err);
        },
        onCancel: (data: any) => {
          console.log(' [PayPal] Pago cancelado por el usuario:', data);
          if (options.onCancel) {
            options.onCancel(data);
          }
        }
      });

      await buttons.render('#' + containerId);
      return true;
    } catch (err) {
      console.error('Error al instanciar PayPal Buttons:', err);
      return false;
    }
  }

  async verificarConBackend(datos: {
    orderId?: string;
    transactionId: string;
    payerEmail: string;
    payerName: string;
    amount: number;
    currency: string;
  }): Promise<RespuestaVerificacionPaypal | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<RespuestaVerificacionPaypal>('http://localhost:8080/api/payments/paypal/verify', datos)
      );
      return res;
    } catch (e) {
      console.warn('Backend PayPal verify no respondió o modo standalone:', e);
      return null;
    }
  }
}
