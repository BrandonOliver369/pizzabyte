import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-mail-notification',
  imports: [CommonModule],
  template: `
    @if (pedidoService.ultimaNotificacion(); as mail) {
      <div class="modal-backdrop animate-fade-in" (click)="cerrar()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="header-left">
              <div class="mail-badge">✉️</div>
              <div>
                <span class="adapter-tag">MailAdapter.java • NotificacionPort</span>
                <h3 class="modal-title">Confirmación de Pedido Despachada</h3>
              </div>
            </div>
            <button class="btn-close" (click)="cerrar()" title="Cerrar">✕</button>
          </div>

          <div class="modal-scroll-area">
            <!-- Banner de Envío Automático Exitoso -->
            <div class="auto-success-banner">
              <div class="auto-success-icon">✅</div>
              <div class="auto-success-content">
                <span class="auto-success-tag">DESPACHADO EN AUTOMÁTICO</span>
                <h4 class="auto-success-title">¡Correo Real Enviado a tu Bandeja!</h4>
                <p class="auto-success-text">
                  El caso de uso ejecutó el puerto <code class="code-hl">NotificacionPort</code> y el <code class="code-hl">MailAdapter</code> envió el correo en automático vía <strong>Brevo SMTP Relay</strong> a:
                </p>
                <div class="recipient-pill">
                  <span class="pill-icon">✉️</span>
                  <strong class="pill-email">{{ mail.destinatario }}</strong>
                  <span class="pill-status">🟢 ENTREGADO</span>
                </div>
              </div>
            </div>

            <!-- Console log representation from Spring Boot / Server -->
            <div class="console-box">
              <div class="console-header">
                <span class="console-dot red"></span>
                <span class="console-dot yellow"></span>
                <span class="console-dot green"></span>
                <span class="console-title">Salida de Consola MailAdapter (Brevo SMTP Relay)</span>
              </div>
              <pre class="console-code"><code><span class="log-info">[INFO]</span> Executing <span class="log-hl">CrearPedidoUseCase.ejecutar()</span>
<span class="log-info">[INFO]</span> <span class="log-hl">PedidoRepositoryPort</span>: Pedido #{{ mail.pedidoId }} persistido
<span class="log-success">[SMTP]</span> Enviando correo SMTP a: <span class="log-val">{{ mail.destinatario }}</span>
<span class="log-success">[SMTP]</span> Mensaje: <span class="log-val">"{{ mail.cuerpo }}"</span>
<span class="log-ok">[OK]</span> 250 2.0.0 OK: Mensaje entregado exitosamente por Brevo SMTP</code></pre>
            </div>

            <!-- Email Mockup Preview -->
            <div class="email-mockup">
              <div class="email-header-meta">
                <div class="email-row">
                  <span class="meta-label">De:</span>
                  <span class="meta-val">PizzaByte 🍕 &lt;brandooliver4&#64;gmail.com&gt; <span class="smtp-tag">Brevo API v3</span></span>
                </div>
                <div class="email-row">
                  <span class="meta-label">Para:</span>
                  <span class="meta-val highlight-recipient">{{ mail.destinatario }}</span>
                </div>
                <div class="email-row">
                  <span class="meta-label">Asunto:</span>
                  <span class="meta-val bold-subject">{{ mail.asunto }}</span>
                </div>
                <div class="email-row">
                  <span class="meta-label">Hora:</span>
                  <span class="meta-val text-muted">{{ mail.timestamp }}</span>
                </div>
              </div>

              <div class="email-body">
                <div class="pizza-icon-big">🍕</div>
                <h4 class="email-heading">¡Gracias por tu compra en PizzaByte!</h4>
                <p class="email-greeting">
                  Tu orden <strong>#{{ mail.pedidoId }}</strong> ha sido confirmada y enviada a tu correo real.
                </p>

                <div class="quote-box">
                  <p class="quote-text">{{ mail.cuerpo }}</p>
                  <span class="quote-author">— Generado automáticamente por MailAdapter (Brevo SMTP)</span>
                </div>

                <div class="order-details-mini">
                  <div class="detail-item">
                    <span class="d-label">Especialidad:</span>
                    <span class="d-val">{{ mail.saborPizza }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="d-label">Estado:</span>
                    <span class="d-val status-pill">HORNEANDO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn-action-primary" (click)="cerrar()" type="button">
              <span>Aceptar y Continuar</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(12px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: #0d0d0d;
      border-radius: 20px;
      width: 100%;
      max-width: 620px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.35);
      overflow: hidden;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: #121212;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mail-badge {
      font-size: 1.5rem;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.3);
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .adapter-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      color: #ef4444;
      text-transform: uppercase;
      display: block;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .btn-close {
      font-size: 1.1rem;
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .modal-scroll-area {
      overflow-y: auto;
      flex: 1;
    }

    /* Banner de éxito automático */
    .auto-success-banner {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(20, 20, 20, 0.95) 100%);
      border-bottom: 1px solid rgba(220, 38, 38, 0.3);
      padding: 1.25rem 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .auto-success-icon {
      font-size: 1.8rem;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.4);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .auto-success-content {
      flex: 1;
    }

    .auto-success-tag {
      font-size: 0.7rem;
      font-weight: 800;
      color: #ef4444;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 0.2rem;
    }

    .auto-success-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.4rem;
    }

    .auto-success-text {
      font-size: 0.85rem;
      color: #cbd5e1;
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .code-hl {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(220, 38, 38, 0.2);
      color: #ffffff;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-size: 0.8em;
    }

    .recipient-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #141414;
      border: 1px solid rgba(220, 38, 38, 0.4);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
    }

    .pill-icon {
      font-size: 1rem;
    }

    .pill-email {
      font-family: 'JetBrains Mono', monospace;
      color: #ffffff;
      font-size: 0.85rem;
    }

    .pill-status {
      font-size: 0.65rem;
      font-weight: 800;
      color: #ffffff;
      background: #dc2626;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
    }

    /* Consola */
    .console-box {
      background: #000000;
      padding: 0.85rem 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .console-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.4rem;
    }

    .console-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .console-dot.red { background: #ef4444; }
    .console-dot.yellow { background: #71717a; }
    .console-dot.green { background: #ffffff; }

    .console-title {
      font-size: 0.7rem;
      color: #71717a;
      margin-left: 0.35rem;
    }

    .console-code {
      margin: 0;
      color: #e2e8f0;
      line-height: 1.4;
      overflow-x: auto;
    }

    .log-info { color: #ffffff; }
    .log-hl { color: #ef4444; }
    .log-success { color: #dc2626; font-weight: bold; }
    .log-val { color: #ffffff; }
    .log-ok { color: #ffffff; font-weight: bold; }

    /* Email Mockup */
    .email-mockup {
      padding: 1.25rem 1.5rem;
      background: #0d0d0d;
    }

    .email-header-meta {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.8rem;
    }

    .email-row {
      display: flex;
      margin-bottom: 0.25rem;
    }
    .email-row:last-child { margin-bottom: 0; }
    .meta-label { width: 55px; color: #71717a; font-weight: 600; }
    .meta-val { color: #cbd5e1; }
    .smtp-tag {
      font-size: 0.65rem;
      background: rgba(220, 38, 38, 0.2);
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.35);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-weight: 700;
      margin-left: 0.4rem;
    }
    .highlight-recipient { color: #ffffff; font-weight: 700; }
    .bold-subject { font-weight: 700; color: #ffffff; }

    .email-body {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }

    .pizza-icon-big { font-size: 2.5rem; margin-bottom: 0.25rem; }
    .email-heading { font-size: 1.1rem; font-weight: 800; color: #ffffff; margin-bottom: 0.35rem; }
    .email-greeting { font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; }

    .quote-box {
      background: rgba(220, 38, 38, 0.08);
      border-left: 4px solid #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 0 8px 8px 0;
      text-align: left;
      margin-bottom: 1rem;
    }

    .quote-text { font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem; }
    .quote-author { font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; color: #ef4444; }

    .order-details-mini {
      display: flex;
      justify-content: space-around;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.75rem;
    }

    .detail-item { display: flex; flex-direction: column; align-items: center; }
    .d-label { font-size: 0.72rem; color: #71717a; font-weight: 600; }
    .d-val { font-size: 0.85rem; font-weight: 700; color: #ffffff; }

    .status-pill {
      background: #dc2626;
      color: #ffffff;
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }

    .modal-footer {
      padding: 0.9rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: flex-end;
      background: #121212;
    }

    .btn-action-primary {
      background: #dc2626;
      color: white;
      font-weight: 700;
      padding: 0.65rem 1.75rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
      border: none;
      cursor: pointer;
    }

    .btn-action-primary:hover {
      background: #b91c1c;
    }
  `]
})
export class MailNotificationComponent {
  readonly pedidoService = inject(PedidoService);

  cerrar(): void {
    this.pedidoService.cerrarModalNotificacion();
  }
}
