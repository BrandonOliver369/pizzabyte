import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { NotificacionMail } from '../../models/pedido.model';

@Component({
  selector: 'app-smtp-inbox',
  imports: [CommonModule],
  template: `
    <div class="inbox-container">
      <div class="inbox-header">
        <div>
          <span class="badge-port">Adaptador de Salida 2: SMTP</span>
          <h2 class="inbox-title">Bandeja de Salida MailAdapter (SMTP)</h2>
          <p class="inbox-subtitle">
            Registro de todos los correos de confirmación despachados a través del puerto 
            <code class="code-inline">NotificacionPort.enviarConfirmacion(Pedido)</code>
          </p>
        </div>

        @if (pedidoService.notificaciones().length > 0) {
          <button class="btn-clear" (click)="pedidoService.limpiarHistorial()">
            Limpiar Bandeja
          </button>
        }
      </div>

      <!-- Spring Boot MailAdapter snippet card -->
      <div class="code-banner">
        <div class="code-banner-header">
          <span>☕ Implementación en Spring Boot (MailAdapter.java):</span>
        </div>
        <pre class="code-preview"><code>&#64;Component
public class MailAdapter implements NotificacionPort &#123;
    &#64;Override
    public void enviarConfirmacion(Pedido pedido) &#123;
        System.out.println("Enviando correo SMTP a: " + pedido.getCorreoCliente());
        System.out.println("Mensaje: Tu pizza de " + pedido.getSaborPizza() + " está en camino.");
    &#125;
&#125;</code></pre>
      </div>

      @if (pedidoService.notificaciones().length === 0) {
        <div class="empty-inbox">
          <div class="empty-icon">📭</div>
          <h3>No se ha enviado ningún correo SMTP todavía</h3>
          <p>Realiza un pedido de pizza desde la pestaña de menú para ver cómo el MailAdapter despacha el correo.</p>
        </div>
      } @else {
        <div class="mail-list">
          @for (mail of pedidoService.notificaciones(); track mail.id) {
            <article class="mail-card" (click)="abrirModal(mail)">
              <div class="mail-top-bar">
                <div class="mail-sender">
                  <span class="mail-dot"></span>
                  <strong>PizzaByte Notifications</strong>
                  <span class="mail-protocol">&lt;pedidos&#64;pizzabyte.com&gt; [SMTP]</span>
                </div>
                <div class="mail-time">{{ mail.timestamp }}</div>
              </div>

              <div class="mail-subject">
                {{ mail.asunto }}
              </div>

              <div class="mail-recipient-line">
                <span class="to-label">Destinatario:</span>
                <span class="to-val">{{ mail.destinatario }}</span>
              </div>

              <div class="mail-quote">
                "{{ mail.cuerpo }}"
              </div>

              <div class="mail-footer-bar">
                <span class="status-badge">✅ SMTP 250 OK - Message Delivered</span>
                <span class="click-hint">Click para ver detalle completo →</span>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .inbox-container {
      max-width: 860px;
      margin: 0 auto 3.5rem;
    }

    .inbox-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .badge-port {
      font-size: 0.75rem;
      font-weight: 700;
      color: #ef4444;
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.3);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
      display: inline-block;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .inbox-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
    }

    .inbox-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .btn-clear {
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.5rem 0.9rem;
      border-radius: var(--radius-sm);
      background: #141414;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      color: #ffffff;
      border-color: rgba(220, 38, 38, 0.5);
      background: rgba(220, 38, 38, 0.15);
    }

    .code-banner {
      background: #000000;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .code-banner-header {
      background: #141414;
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .code-preview {
      margin: 0;
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.825rem;
      color: #e2e8f0;
      line-height: 1.4;
      overflow-x: auto;
    }

    .empty-inbox {
      background: #141414;
      border: 2px dashed rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-lg);
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: #ffffff;
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .empty-inbox h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }

    .empty-inbox p {
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .mail-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mail-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .mail-card:hover {
      border-color: rgba(220, 38, 38, 0.4);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.2);
      transform: translateY(-2px);
    }

    .mail-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .mail-sender {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #ffffff;
    }

    .mail-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc2626;
    }

    .mail-protocol {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .mail-time {
      font-size: 0.8rem;
      color: #64748b;
      font-family: var(--font-mono);
    }

    .mail-subject {
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.4rem;
    }

    .mail-recipient-line {
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .to-label {
      color: #94a3b8;
      margin-right: 0.35rem;
    }

    .to-val {
      color: #ffffff;
      font-weight: 600;
    }

    .mail-quote {
      background: rgba(220, 38, 38, 0.08);
      border-left: 3px solid #dc2626;
      padding: 0.6rem 0.9rem;
      border-radius: 0 4px 4px 0;
      font-style: italic;
      color: #ffffff;
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }

    .mail-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .status-badge {
      color: #ef4444;
      font-weight: 600;
      font-family: var(--font-mono);
    }

    .click-hint {
      color: #64748b;
    }
  `]
})
export class SmtpInboxComponent {
  readonly pedidoService = inject(PedidoService);

  abrirModal(mail: NotificacionMail): void {
    this.pedidoService.ultimaNotificacion.set(mail);
  }
}
