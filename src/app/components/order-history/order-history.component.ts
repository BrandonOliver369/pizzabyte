import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { Pedido, NotificacionMail } from '../../models/pedido.model';

@Component({
  selector: 'app-order-history',
  imports: [CommonModule],
  template: `
    <div class="history-container">
      <div class="history-header">
        <div>
          <h2 class="history-title">Seguimiento de Mis Pedidos</h2>
          <p class="history-subtitle">
            Consulta el estado de preparación y despacho de todas tus órdenes recientes en PizzaByte.
          </p>
        </div>

        <div class="header-actions">
          @if (pedidoService.pedidos().length > 0) {
            <button class="btn-clear" (click)="pedidoService.limpiarHistorial()" title="Borrar pedidos locales">
              🗑️ Limpiar Historial
            </button>
          }
          <button class="btn-new-order" (click)="irAFormulario.emit()">
            ➕ Nuevo Pedido
          </button>
        </div>
      </div>

      @if (pedidoService.pedidos().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🍕</div>
          <h3>No hay pedidos registrados todavía</h3>
          <p>Selecciona una pizza del menú para comenzar tu primer pedido.</p>
          <button class="btn-primary-action" (click)="irAFormulario.emit()">
            Ir al Menú
          </button>
        </div>
      } @else {
        <div class="orders-list">
          @for (pedido of pedidoService.pedidos(); track pedido.id) {
            <div class="order-item-card">
              <div class="order-main-info">
                <div class="order-id-badge">
                  <span class="id-label">ORDEN</span>
                  <span class="id-number">#{{ pedido.id }}</span>
                </div>

                <div class="order-details">
                  <h4 class="order-flavor">{{ pedido.saborPizza }}</h4>
                  <div class="order-meta">
                    <span class="meta-tag">
                      <span class="icon">✉️</span> {{ pedido.correoCliente }}
                    </span>
                    @if (pedido.fechaCreacion) {
                      <span class="meta-tag">
                        <span class="icon">🕒</span> {{ pedido.fechaCreacion }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div class="order-side-info">
                <div class="order-price">
                  \${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}
                </div>
                <div class="order-status-pill status-ready">
                  CONFIRMADO
                </div>
                <button 
                  class="btn-view-mail" 
                  (click)="verCorreoAsociado(pedido)"
                  title="Ver confirmación SMTP enviada por MailAdapter">
                  ✉️ Ver Mail SMTP
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 860px;
      margin: 0 auto 3.5rem;
    }

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .history-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .history-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-clear {
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.5rem 0.9rem;
      border-radius: var(--radius-sm);
      background: #121212;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      color: #ffffff;
      border-color: rgba(220, 38, 38, 0.5);
      background: rgba(220, 38, 38, 0.15);
    }

    .btn-new-order {
      font-size: 0.85rem;
      font-weight: 700;
      color: white;
      background: #dc2626;
      padding: 0.55rem 1rem;
      border-radius: var(--radius-sm);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
      border: none;
      cursor: pointer;
    }

    .btn-new-order:hover {
      background: #b91c1c;
    }

    .empty-state {
      background: #121212;
      border: 2px dashed rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-lg);
      padding: 3.5rem 1.5rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }

    .empty-state p {
      color: #94a3b8;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .btn-primary-action {
      background: #dc2626;
      color: white;
      font-weight: 700;
      padding: 0.75rem 1.75rem;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
    }

    .btn-primary-action:hover {
      background: #b91c1c;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-item-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .order-item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
      border-color: rgba(220, 38, 38, 0.4);
    }

    .order-main-info {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex: 1;
    }

    .order-id-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #181818;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.65rem;
      min-width: 70px;
    }

    .id-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }

    .id-number {
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 1.1rem;
      color: #ef4444;
    }

    .order-flavor {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .order-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .meta-tag {
      font-size: 0.8rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .order-side-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.4rem;
    }

    .order-price {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
    }

    .order-status-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }

    .status-ready {
      background: #dc2626;
      color: #ffffff;
    }

    .btn-view-mail {
      font-size: 0.75rem;
      font-weight: 600;
      color: #ffffff;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.35);
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view-mail:hover {
      background: #dc2626;
      color: #ffffff;
    }

    @media (max-width: 680px) {
      .order-item-card {
        flex-direction: column;
        align-items: flex-start;
      }
      .order-side-info {
        align-items: flex-start;
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 0.75rem;
      }
    }
  `]
})
export class OrderHistoryComponent {
  readonly pedidoService = inject(PedidoService);
  irAFormulario = output<void>();

  verCorreoAsociado(pedido: Pedido): void {
    const notif = this.pedidoService.notificaciones().find(n => n.pedidoId === pedido.id);
    if (notif) {
      this.pedidoService.ultimaNotificacion.set(notif);
    } else {
      // Si no existe en la lista de notificaciones, regenerar para vista
      const tempMail: NotificacionMail = {
        id: 'MAIL-HIST-' + pedido.id,
        pedidoId: pedido.id,
        destinatario: pedido.correoCliente,
        asunto: `¡Tu pedido #${pedido.id} está en camino! 🍕 - PizzaByte`,
        cuerpo: `Tu pizza de ${pedido.saborPizza} está en camino.`,
        saborPizza: pedido.saborPizza,
        timestamp: pedido.fechaCreacion || 'Recientemente',
        estadoEnvio: 'ENVIADO'
      };
      this.pedidoService.ultimaNotificacion.set(tempMail);
    }
  }
}
