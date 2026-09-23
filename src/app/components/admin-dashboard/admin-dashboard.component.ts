import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { Pedido, EstadoPedido, SaborPizza, EventoAuditoria } from '../../models/pedido.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  template: `
    @if (!authService.esAdmin()) {
      <!-- TERMINAL DE COMANDO & ACCESO RESTRINGIDO KDS -->
      <div class="terminal-auth-wrapper animate-fade-in">
        <div class="terminal-container">
          
          <!-- Barra Superior del Terminal -->
          <div class="terminal-top-bar">
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <div class="terminal-sys-title">
              <span>PIZZABYTE INTERNAL OS // TERMINAL KDS v3.4</span>
            </div>
            <div class="terminal-status-indicator">
              <span class="pulse-beacon red"></span>
              <span class="status-text">STAFF ONLY</span>
            </div>
          </div>

          <!-- Tarjeta Principal del Terminal -->
          <div class="terminal-card glass-panel">
            <div class="terminal-badge-row">
              <span class="terminal-cyber-badge">🛡️ SISTEMA DE COCINA INTERNO</span>
              <span class="terminal-protocol-pill">SHA-256 HMAC</span>
            </div>

            <div class="terminal-hero">
              <div class="terminal-shield-icon">
                <span class="shield-glyph">🔒</span>
              </div>
              <h1 class="terminal-title">
                Terminal Operativo <span class="title-accent">KDS & Cocina</span>
              </h1>
              <p class="terminal-desc">
                Consola independiente de alta seguridad para maestros de horno, chefs de línea y despacho. Acceso restringido exclusivamente a personal de operaciones.
              </p>
            </div>

            <div class="terminal-security-notice">
              <span class="notice-icon">⚠️</span>
              <div class="notice-body">
                <strong>CONSOLA INTERNA DE OPERACIONES:</strong>
                <span>Esta área no es accesible para clientes ni admite registro público. Si deseas ordenar pizzas o ver tu cuenta de usuario, regresa a la tienda.</span>
              </div>
            </div>

            @if (terminalError()) {
              <div class="terminal-error-banner animate-shake">
                <span class="err-icon">🛑</span>
                <div class="err-text">
                  <strong>ACCESO DENEGADO:</strong>
                  <span>{{ terminalError() }}</span>
                </div>
              </div>
            }

            <form (submit)="ejecutarLoginTerminal($event)" class="terminal-form">
              <div class="terminal-field-group">
                <label for="terminal-user" class="terminal-label">
                  <span class="t-prefix">&gt;</span> IDENTIFICADOR DE OPERADOR (OPERATOR_ID)
                </label>
                <div class="terminal-input-wrap">
                  <span class="t-icon">👤</span>
                  <input 
                    id="terminal-user"
                    type="text" 
                    [ngModel]="terminalUsername()"
                    (ngModelChange)="terminalUsername.set($event)"
                    name="terminalUser"
                    placeholder="admin"
                    required
                    autocomplete="off"
                    class="terminal-input font-mono" />
                </div>
              </div>

              <div class="terminal-field-group">
                <label for="terminal-pass" class="terminal-label">
                  <span class="t-prefix">&gt;</span> CLAVE MAESTRA DE SEGURIDAD (KEY)
                </label>
                <div class="terminal-input-wrap">
                  <span class="t-icon">🔐</span>
                  <input 
                    id="terminal-pass"
                    type="password" 
                    [ngModel]="terminalPassword()"
                    (ngModelChange)="terminalPassword.set($event)"
                    name="terminalPass"
                    placeholder="••••••••••••"
                    required
                    autocomplete="current-password"
                    class="terminal-input font-mono" />
                </div>
              </div>

              <button 
                type="submit" 
                class="btn-terminal-submit btn-shimmer"
                [disabled]="terminalProcesando() || !terminalUsername() || !terminalPassword()">
                @if (terminalProcesando()) {
                  <span class="spinner-terminal"></span>
                  <span>VALIDANDO KERNEL SHA-256...</span>
                } @else {
                  <span class="t-btn-icon">⚡</span>
                  <span>AUTORIZAR ACCESO AL SISTEMA KDS</span>
                  <span class="t-arrow">→</span>
                }
              </button>

              <!-- Atajo Rápido para Operador / Evaluador -->
              <div class="terminal-operator-shortcut">
                <span class="shortcut-desc">Acceso rápido para evaluación operativa:</span>
                <button 
                  type="button" 
                  class="btn-shortcut-chip" 
                  (click)="cargarPresetAdmin()">
                  <span>👑 Cargar Operador: admin / pizza123</span>
                </button>
              </div>
            </form>

            <div class="terminal-card-footer">
              <button type="button" class="terminal-btn-back" (click)="irACliente.emit()">
                <span>← Volver a la Tienda Pública de Clientes</span>
              </button>
              <span class="terminal-foot-meta">PIZZABYTE OS 2026 • PORT 4200/8080 • SHA-256</span>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="admin-wrapper animate-fade-in">
        
        <!-- CABECERA PRINCIPAL DEL PANEL ADMINISTRATIVO -->
        <header class="admin-header glass-panel">
          <div class="header-main-info">
            <div class="admin-badge-row">
              <span class="pulse-beacon red"></span>
              <span class="admin-badge">SISTEMA INTERNO KDS • ATELIER PIZZABYTE</span>
              <span class="live-pill">🔴 EN VIVO</span>
            </div>
            <h1 class="admin-title">
              Consola de Administración <span class="title-accent">& Cocina</span>
            </h1>
            <p class="admin-subtitle">
              Gestión interna de pedidos, control de horno de leña a 400°C, despacho express y auditoría operativa.
            </p>
          </div>

          <div class="header-actions">
            <button 
              type="button" 
              class="btn-admin-cta btn-shimmer"
              (click)="abrirModalPedidoManual()">
              <span class="btn-icon">➕</span>
              <span>Nuevo Pedido Manual</span>
            </button>

            <button 
              type="button" 
              class="btn-admin-secondary"
              [class.active]="vistaActual() === 'menu_stock'"
              (click)="cambiarVista(vistaActual() === 'menu_stock' ? 'kds' : 'menu_stock')">
              <span>{{ vistaActual() === 'menu_stock' ? '🍕 Ver Tablero KDS' : '📋 Control de Menú' }}</span>
            </button>

            <button 
              type="button" 
              class="btn-admin-secondary"
              [class.active]="vistaActual() === 'auditoria'"
              (click)="cambiarVista(vistaActual() === 'auditoria' ? 'kds' : 'auditoria')">
              <span>{{ vistaActual() === 'auditoria' ? '🍕 Ver Tablero KDS' : '📜 Auditoría' }}</span>
            </button>

            <!-- Acciones Rápidas de Operador -->
            <div class="operator-quick-actions">
              <span class="operator-badge-pill" title="Sesión de Operador Activa">
                <span class="operator-dot"></span>
                <span class="operator-name">{{ authService.usuarioActual()?.nombre || 'Administrador' }}</span>
              </span>
              <button 
                type="button" 
                class="btn-header-public" 
                (click)="irACliente.emit()" 
                title="Volver a la tienda como cliente">
                <span>🌐 Tienda</span>
              </button>
              <button 
                type="button" 
                class="btn-header-lock" 
                (click)="cerrarSesionAdmin()" 
                title="Bloquear terminal y cerrar sesión">
                <span>🔒 Salir</span>
              </button>
            </div>
          </div>
        </header>

      <!-- BARRA DE KPIS Y MÉTRICAS EN VIVO -->
      <section class="kpi-grid">
        <div class="kpi-card glass-panel">
          <div class="kpi-icon-box red-glow">💰</div>
          <div class="kpi-data">
            <span class="kpi-label">Ventas Totales</span>
            <strong class="kpi-value">\${{ totalVentas() | number:'1.2-2' }}</strong>
            <span class="kpi-meta">Acumulado del turno</span>
          </div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-icon-box red-glow">🔥</div>
          <div class="kpi-data">
            <span class="kpi-label">En Cocina / Horno</span>
            <strong class="kpi-value">{{ pedidosEnCocina() }}</strong>
            <span class="kpi-meta">Forno a Legna 400°C</span>
          </div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-icon-box red-glow">🛵</div>
          <div class="kpi-data">
            <span class="kpi-label">En Reparto Express</span>
            <strong class="kpi-value">{{ pedidosEnReparto() }}</strong>
            <span class="kpi-meta">Garantía &lt; 30 min</span>
          </div>
        </div>

        <div class="kpi-card glass-panel">
          <div class="kpi-icon-box red-glow">✅</div>
          <div class="kpi-data">
            <span class="kpi-label">Completados Hoy</span>
            <strong class="kpi-value">{{ pedidosEntregados() }}</strong>
            <span class="kpi-meta">Tasa de éxito {{ tasaCumplimiento() }}%</span>
          </div>
        </div>
      </section>

      <!-- VISTA 1: TABLERO KANBAN KDS (COCINA Y DESPACHO) -->
      @if (vistaActual() === 'kds') {
        <div class="kds-section animate-fade-in">
          
          <!-- BARRA DE BÚSQUEDA Y FILTROS -->
          <div class="kds-toolbar glass-panel">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por #ID, cliente, correo o sabor..."
                [ngModel]="busquedaTexto()"
                (ngModelChange)="busquedaTexto.set($event)"
                class="search-input" />
              @if (busquedaTexto()) {
                <button class="clear-search" (click)="busquedaTexto.set('')">✕</button>
              }
            </div>

            <div class="filter-pills-row">
              <span class="filter-label">Origen:</span>
              <button 
                type="button" 
                class="admin-filter-chip"
                [class.active]="filtroOrigen() === 'TODOS'"
                (click)="filtroOrigen.set('TODOS')">
                Todos ({{ pedidoService.pedidos().length }})
              </button>
              <button 
                type="button" 
                class="admin-filter-chip"
                [class.active]="filtroOrigen() === 'WEB'"
                (click)="filtroOrigen.set('WEB')">
                🌐 Tienda Web
              </button>
              <button 
                type="button" 
                class="admin-filter-chip"
                [class.active]="filtroOrigen() === 'TELEFONO'"
                (click)="filtroOrigen.set('TELEFONO')">
                📞 Teléfono
              </button>
              <button 
                type="button" 
                class="admin-filter-chip"
                [class.active]="filtroOrigen() === 'MOSTRADOR'"
                (click)="filtroOrigen.set('MOSTRADOR')">
                🏬 Mostrador
              </button>
            </div>
          </div>

          <!-- TABLERO KANBAN DE 4 COLUMNAS TÁCTILES -->
          <div class="kanban-board">
            
            <!-- COLUMNA 1: RECIBIDOS / POR HORNEAR -->
            <div class="kanban-col col-recibidos">
              <div class="col-header">
                <div class="col-title-group">
                  <span class="col-indicator orange"></span>
                  <h3 class="col-title">1. Recibidos / Por Hornear</h3>
                </div>
                <span class="col-counter">{{ pedidosRecibidos().length }}</span>
              </div>

              <div class="col-orders-list">
                @for (pedido of pedidosRecibidos(); track pedido.id) {
                  <article class="order-kds-card glass-panel animate-slide-up">
                    <div class="card-top-bar">
                      <span class="order-number">#{{ pedido.id }}</span>
                      <span class="order-origin-badge" [class]="'origin-' + (pedido.origen || 'WEB').toLowerCase()">
                        {{ pedido.origen === 'TELEFONO' ? '📞 Tel' : (pedido.origen === 'MOSTRADOR' ? '🏬 Local' : '🌐 Web') }}
                      </span>
                      @if (pedido.metodoPago === 'PAYPAL') {
                        <span class="paypal-kds-badge" title="Transacción: {{ pedido.idTransaccionPaypal || 'Verificado' }}">🅿️ PayPal (PAGADO)</span>
                      }
                      <span class="order-time">{{ pedido.fechaCreacion || 'Hace unos min' }}</span>
                    </div>

                    <h4 class="card-pizza-title">{{ pedido.saborPizza }}</h4>
                    
                    <div class="card-client-info">
                      <span class="client-name">👤 {{ pedido.clienteNombre || 'Cliente PizzaByte' }}</span>
                      <span class="client-email">✉️ {{ pedido.correoCliente }}</span>
                      @if (pedido.direccionEntrega) {
                        <span class="client-address">📍 {{ pedido.direccionEntrega }}</span>
                      }
                    </div>

                    @if (pedido.notasCocina) {
                      <div class="kitchen-note-box">
                        <span class="note-icon">📝</span>
                        <span class="note-text">{{ pedido.notasCocina }}</span>
                      </div>
                    }

                    <div class="card-footer-row">
                      <span class="card-price">\${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}</span>
                      <div class="card-actions">
                        <button 
                          type="button"
                          class="btn-action-primary fire"
                          (click)="cambiarEstado(pedido, 'EN_HORNO')"
                          title="Meter orden al horno de leña a 400°C">
                          <span>🔥 Meter al Horno</span>
                        </button>
                        <button 
                          type="button" 
                          class="btn-action-icon" 
                          (click)="eliminarOrden(pedido)"
                          title="Cancelar orden">
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                  </article>
                } @empty {
                  <div class="empty-column-state">
                    <span>☕ No hay órdenes en espera</span>
                  </div>
                }
              </div>
            </div>

            <!-- COLUMNA 2: AL HORNO DE LEÑA (400°C) -->
            <div class="kanban-col col-horno">
              <div class="col-header">
                <div class="col-title-group">
                  <span class="col-indicator red pulse-infinite"></span>
                  <h3 class="col-title">2. En Horno a la Leña (400°C)</h3>
                </div>
                <span class="col-counter">{{ pedidosHorneando().length }}</span>
              </div>

              <div class="col-orders-list">
                @for (pedido of pedidosHorneando(); track pedido.id) {
                  <article class="order-kds-card glass-panel card-in-oven animate-slide-up">
                    <div class="card-top-bar">
                      <span class="order-number">#{{ pedido.id }}</span>
                      <span class="status-pill baking">🔥 HORNEANDO</span>
                      @if (pedido.metodoPago === 'PAYPAL') {
                        <span class="paypal-kds-badge" title="Transacción: {{ pedido.idTransaccionPaypal || 'Verificado' }}">🅿️ PayPal (PAGADO)</span>
                      }
                      <span class="order-time">~8 min restantes</span>
                    </div>

                    <h4 class="card-pizza-title">{{ pedido.saborPizza }}</h4>
                    
                    <div class="card-client-info">
                      <span class="client-name">👤 {{ pedido.clienteNombre || 'Cliente' }}</span>
                      <span class="client-email">✉️ {{ pedido.correoCliente }}</span>
                    </div>

                    @if (pedido.notasCocina) {
                      <div class="kitchen-note-box">
                        <span class="note-icon">📝</span>
                        <span class="note-text">{{ pedido.notasCocina }}</span>
                      </div>
                    }

                    <div class="card-footer-row">
                      <span class="card-price">\${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}</span>
                      <div class="card-actions">
                        <button 
                          type="button"
                          class="btn-action-primary scooter"
                          (click)="cambiarEstado(pedido, 'EN_CAMINO')"
                          title="Sacar del horno y despachar a reparto express">
                          <span>🛵 Despachar a Reparto</span>
                        </button>
                        <button 
                          type="button" 
                          class="btn-action-icon"
                          (click)="cambiarEstado(pedido, 'CONFIRMADO')"
                          title="Regresar a Recibidos">
                          <span>↩️</span>
                        </button>
                      </div>
                    </div>
                  </article>
                } @empty {
                  <div class="empty-column-state">
                    <span>🔥 Horno en temperatura óptima (400°C)</span>
                  </div>
                }
              </div>
            </div>

            <!-- COLUMNA 3: EN REPARTO EXPRESS -->
            <div class="kanban-col col-reparto">
              <div class="col-header">
                <div class="col-title-group">
                  <span class="col-indicator blue pulse-infinite"></span>
                  <h3 class="col-title">3. En Reparto Express</h3>
                </div>
                <span class="col-counter">{{ pedidosRepartiendo().length }}</span>
              </div>

              <div class="col-orders-list">
                @for (pedido of pedidosRepartiendo(); track pedido.id) {
                  <article class="order-kds-card glass-panel card-in-transit animate-slide-up">
                    <div class="card-top-bar">
                      <span class="order-number">#{{ pedido.id }}</span>
                      <span class="status-pill courier">🛵 EN RUTA</span>
                      @if (pedido.metodoPago === 'PAYPAL') {
                        <span class="paypal-kds-badge" title="Transacción: {{ pedido.idTransaccionPaypal || 'Verificado' }}">🅿️ PayPal (PAGADO)</span>
                      }
                      <span class="order-time">&lt; 20 min</span>
                    </div>

                    <h4 class="card-pizza-title">{{ pedido.saborPizza }}</h4>
                    
                    <div class="card-client-info">
                      <span class="client-name">👤 {{ pedido.clienteNombre || 'Cliente' }}</span>
                      <span class="client-address highlight">📍 {{ pedido.direccionEntrega || 'Zona Centro - Delivery Express' }}</span>
                      <span class="client-email">✉️ {{ pedido.correoCliente }}</span>
                    </div>

                    <div class="card-footer-row">
                      <span class="card-price">\${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}</span>
                      <div class="card-actions">
                        <button 
                          type="button"
                          class="btn-action-primary success"
                          (click)="cambiarEstado(pedido, 'ENTREGADO')"
                          title="Confirmar entrega al cliente">
                          <span>✅ Confirmar Entrega</span>
                        </button>
                        <button 
                          type="button" 
                          class="btn-action-icon"
                          (click)="cambiarEstado(pedido, 'EN_HORNO')"
                          title="Regresar a Horno">
                          <span>↩️</span>
                        </button>
                      </div>
                    </div>
                  </article>
                } @empty {
                  <div class="empty-column-state">
                    <span>🛵 No hay repartidores en ruta</span>
                  </div>
                }
              </div>
            </div>

            <!-- COLUMNA 4: ENTREGADOS CON ÉXITO -->
            <div class="kanban-col col-entregados">
              <div class="col-header">
                <div class="col-title-group">
                  <span class="col-indicator green"></span>
                  <h3 class="col-title">4. Entregados con Éxito</h3>
                </div>
                <span class="col-counter">{{ pedidosCompletados().length }}</span>
              </div>

              <div class="col-orders-list">
                @for (pedido of pedidosCompletados(); track pedido.id) {
                  <article class="order-kds-card glass-panel card-delivered animate-slide-up">
                    <div class="card-top-bar">
                      <span class="order-number">#{{ pedido.id }}</span>
                      <span class="status-pill delivered">✅ ENTREGADO</span>
                      @if (pedido.metodoPago === 'PAYPAL') {
                        <span class="paypal-kds-badge" title="Transacción: {{ pedido.idTransaccionPaypal || 'Verificado' }}">🅿️ PayPal (PAGADO)</span>
                      }
                      <span class="order-time">{{ pedido.fechaCreacion || 'Hoy' }}</span>
                    </div>

                    <h4 class="card-pizza-title">{{ pedido.saborPizza }}</h4>
                    
                    <div class="card-client-info">
                      <span class="client-name">👤 {{ pedido.clienteNombre || 'Cliente' }}</span>
                      <span class="client-email">✉️ {{ pedido.correoCliente }}</span>
                    </div>

                    <div class="card-footer-row">
                      <span class="card-price">\${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}</span>
                      <div class="card-actions">
                        <span class="delivered-badge">✨ Venta Cerrada</span>
                        <button 
                          type="button" 
                          class="btn-action-icon"
                          (click)="cambiarEstado(pedido, 'EN_CAMINO')"
                          title="Reabrir a En Reparto si hubo algún error">
                          <span>↩️</span>
                        </button>
                      </div>
                    </div>
                  </article>
                } @empty {
                  <div class="empty-column-state">
                    <span>📦 Las órdenes entregadas se archivarán aquí</span>
                  </div>
                }
              </div>
            </div>

          </div>
        </div>
      }

      <!-- VISTA 2: CONTROL DE MENÚ & STOCK DE PIZZAS -->
      @if (vistaActual() === 'menu_stock') {
        <div class="stock-section glass-panel animate-fade-in">
          <div class="section-title-row">
            <div>
              <h2 class="sub-title">Control de Menú & Disponibilidad de Ingredientes</h2>
              <p class="sub-desc">
                Habilita o pausa sabores del catálogo al instante según el inventario del horno y masa madre fresca.
              </p>
            </div>
            <button class="btn-back-kds" (click)="cambiarVista('kds')">
              ← Regresar al Tablero KDS
            </button>
          </div>

          <div class="pizzas-stock-table-wrapper">
            <table class="stock-table">
              <thead>
                <tr>
                  <th>Pizza & Receta</th>
                  <th>Categoría</th>
                  <th>Precio Base</th>
                  <th>Calorías</th>
                  <th>Estado en Menú</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (pizza of pedidoService.catalogoPizzasModificable(); track pizza.id) {
                  <tr [class.row-disabled]="pizza.disponible === false">
                    <td class="td-pizza-info">
                      <div class="stock-pizza-cell">
                        <span class="stock-emoji">{{ pizza.imagen }}</span>
                        <div>
                          <strong class="pizza-name">{{ pizza.nombre }}</strong>
                          <span class="pizza-sub">{{ pizza.subtituloItaliano || 'PizzaByte Haute Cuisine' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      @if (pizza.popular) { <span class="badge-tag gold">⭐ Popular</span> }
                      @if (pizza.vegetariana) { <span class="badge-tag green">🌱 Veggie</span> }
                      @if (pizza.picante) { <span class="badge-tag red">🌶️ Picante</span> }
                    </td>
                    <td>
                      <div class="price-edit-cell">
                        <span class="currency">$</span>
                        <input 
                          type="number" 
                          step="0.50" 
                          [ngModel]="pizza.precio"
                          (change)="actualizarPrecio(pizza.id, $event)"
                          class="price-input" />
                      </div>
                    </td>
                    <td class="text-muted">{{ pizza.calorias }} kcal</td>
                    <td>
                      <span class="stock-status-pill" [class.available]="pizza.disponible !== false" [class.out]="pizza.disponible === false">
                        {{ pizza.disponible === false ? '⛔ Agotada' : '✅ Disponible' }}
                      </span>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        class="btn-toggle-stock"
                        [class.btn-out]="pizza.disponible !== false"
                        (click)="alternarStock(pizza.id)">
                        {{ pizza.disponible === false ? 'Activar' : 'Pausar' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- VISTA 3: REGISTRO DE AUDITORÍA OPERATIVA (AUDIT LOG) -->
      @if (vistaActual() === 'auditoria') {
        <div class="audit-section glass-panel animate-fade-in">
          <div class="section-title-row">
            <div>
              <h2 class="sub-title">Registro de Auditoría Interna & Trazabilidad</h2>
              <p class="sub-desc">
                Eventos cronológicos de cocina, cambios de estado en despachos y modificaciones de inventario.
              </p>
            </div>
            <button class="btn-back-kds" (click)="cambiarVista('kds')">
              ← Regresar al Tablero KDS
            </button>
          </div>

          <div class="audit-feed">
            @for (evento of pedidoService.registroAuditoria(); track evento.id) {
              <div class="audit-event-item">
                <span class="audit-time">{{ evento.timestamp }}</span>
                <span class="audit-type-chip" [class]="'type-' + evento.tipo.toLowerCase()">
                  {{ evento.tipo }}
                </span>
                <div class="audit-content">
                  <strong class="audit-action">{{ evento.accion }}</strong>
                  <p class="audit-detail">{{ evento.detalle }}</p>
                </div>
                <span class="audit-user">👤 {{ evento.usuario }}</span>
              </div>
            } @empty {
              <div class="empty-column-state">
                <span>No hay eventos registrados en este turno</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- MODAL DE ALTA DE PEDIDO MANUAL / TELEFÓNICO -->
      @if (modalManualAbierto()) {
        <div class="modal-backdrop animate-fade-in" (click)="cerrarModalManual()">
          <div class="modal-card glass-panel animate-scale-up" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-box">
                <span class="modal-icon">📞</span>
                <div>
                  <h3 class="modal-title">Tomar Nuevo Pedido Manual</h3>
                  <p class="modal-subtitle">Para órdenes telefónicas (Concierge) o clientes en mostrador.</p>
                </div>
              </div>
              <button class="btn-close-modal" (click)="cerrarModalManual()">✕</button>
            </div>

            <form class="modal-body" (submit)="confirmarPedidoManual($event)">
              
              <!-- Selector de Origen -->
              <div class="form-group">
                <label class="form-label">Canal de Entrada</label>
                <div class="channel-toggle-row">
                  <label class="channel-opt" [class.selected]="manualOrigen() === 'MOSTRADOR'">
                    <input type="radio" name="origen" value="MOSTRADOR" [checked]="manualOrigen() === 'MOSTRADOR'" (change)="manualOrigen.set('MOSTRADOR')" />
                    <span>🏬 Mostrador / Local</span>
                  </label>
                  <label class="channel-opt" [class.selected]="manualOrigen() === 'TELEFONO'">
                    <input type="radio" name="origen" value="TELEFONO" [checked]="manualOrigen() === 'TELEFONO'" (change)="manualOrigen.set('TELEFONO')" />
                    <span>📞 Teléfono Concierge</span>
                  </label>
                </div>
              </div>

              <!-- Nombre y Correo del Cliente -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Nombre del Cliente</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="Ej: Sofia Loren"
                    [ngModel]="manualClienteNombre()"
                    (ngModelChange)="manualClienteNombre.set($event)"
                    name="clienteNombre"
                    required />
                </div>
                <div class="form-group">
                  <label class="form-label">Correo Electrónico (Notificación Brevo)</label>
                  <input 
                    type="email" 
                    class="form-input" 
                    placeholder="cliente@gmail.com"
                    [ngModel]="manualCorreo()"
                    (ngModelChange)="manualCorreo.set($event)"
                    name="correoCliente"
                    required />
                </div>
              </div>

              <!-- Sabor y Tamaño -->
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Sabor de Pizza</label>
                  <select 
                    class="form-select" 
                    [ngModel]="manualSabor()"
                    (ngModelChange)="manualSabor.set($event)"
                    name="sabor">
                    @for (p of pedidoService.catalogoPizzasModificable(); track p.id) {
                      <option [value]="p.nombre" [disabled]="p.disponible === false">
                        {{ p.nombre }} - \${{ p.precio | number:'1.2-2' }} {{ p.disponible === false ? '(AGOTADA)' : '' }}
                      </option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tamaño</label>
                  <select 
                    class="form-select" 
                    [ngModel]="manualTamano()"
                    (ngModelChange)="manualTamano.set($event)"
                    name="tamano">
                    <option value="Grande Familiar">Grande Familiar (8 Porciones)</option>
                    <option value="Mediana Clásica">Mediana Clásica (6 Porciones)</option>
                    <option value="Personal Gourmet">Personal Gourmet (4 Porciones)</option>
                  </select>
                </div>
              </div>

              <!-- Dirección de Entrega (si es teléfono) -->
              @if (manualOrigen() === 'TELEFONO') {
                <div class="form-group">
                  <label class="form-label">Dirección de Entrega</label>
                  <input 
                    type="text" 
                    class="form-input" 
                    placeholder="Calle, número exterior e interior, colonia..."
                    [ngModel]="manualDireccion()"
                    (ngModelChange)="manualDireccion.set($event)"
                    name="direccion"
                    required />
                </div>
              }

              <!-- Notas para el Maestro Pizzero -->
              <div class="form-group">
                <label class="form-label">Notas de Cocina para el Forno</label>
                <textarea 
                  class="form-textarea" 
                  rows="2" 
                  placeholder="Ej: Masa bien tostada, jalapeños aparte, cortar en 8 porciones..."
                  [ngModel]="manualNotas()"
                  (ngModelChange)="manualNotas.set($event)"
                  name="notas"></textarea>
              </div>

              <!-- Resumen y Submit -->
              <div class="modal-footer-row">
                <div class="price-summary">
                  <span class="sum-label">Precio Estimado:</span>
                  <strong class="sum-val">\${{ calcularPrecioManual() | number:'1.2-2' }}</strong>
                </div>

                <div class="modal-btn-group">
                  <button type="button" class="btn-cancel" (click)="cerrarModalManual()">Cancelar</button>
                  <button type="submit" class="btn-submit-order btn-shimmer">
                    <span>🚀 Despachar Orden a Cocina</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      }

      </div>
    }
  `,
  styles: [`
    /* ================================================================
       ESTILOS DEL PANEL DE ADMINISTRACIÓN - LUXURY DARK, RED & WHITE
       ================================================================ */
    .admin-wrapper {
      max-width: 1440px;
      margin: 0 auto;
      padding: 1.5rem 1.25rem 4rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    /* Glass Panels */
    .glass-panel {
      background: radial-gradient(circle at 20% 20%, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1);
      position: relative;
    }

    /* Header */
    .admin-header {
      padding: 2rem 2.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
      border-top: 2px solid #dc2626;
    }

    .admin-badge-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.5rem;
    }

    .pulse-beacon {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 0 0 10px #ef4444;
      animation: pulseGlow 1.8s infinite;
    }

    .admin-badge {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #cbd5e1;
    }

    .live-pill {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.5);
      color: #ef4444;
      letter-spacing: 0.05em;
    }

    .admin-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .title-accent {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .admin-subtitle {
      color: #94a3b8;
      font-size: 0.92rem;
      margin: 0;
      max-width: 680px;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .btn-admin-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%);
      color: #ffffff;
      padding: 0.85rem 1.6rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(220, 38, 38, 0.45);
      transition: all 0.25s ease;
    }

    .btn-admin-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(220, 38, 38, 0.65);
    }

    .btn-admin-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      padding: 0.85rem 1.35rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-admin-secondary:hover, .btn-admin-secondary.active {
      background: rgba(220, 38, 38, 0.15);
      border-color: #ef4444;
      color: #ffffff;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .kpi-card {
      padding: 1.4rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.2rem;
      transition: transform 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: rgba(220, 38, 38, 0.4);
    }

    .kpi-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      flex-shrink: 0;
    }

    .kpi-data {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      font-weight: 600;
    }

    .kpi-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      margin: 0.2rem 0;
    }

    .kpi-meta {
      font-size: 0.74rem;
      color: #cbd5e1;
    }

    /* KDS Toolbar */
    .kds-toolbar {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0.45rem 0.9rem;
      gap: 0.6rem;
      width: 380px;
      max-width: 100%;
    }

    .search-input {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      width: 100%;
    }

    .clear-search {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .filter-pills-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 600;
      margin-right: 0.25rem;
    }

    .admin-filter-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 0.35rem 0.85rem;
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .admin-filter-chip:hover, .admin-filter-chip.active {
      background: #dc2626;
      border-color: #ef4444;
      color: #ffffff;
    }

    /* Kanban Board */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      align-items: start;
    }

    .kanban-col {
      background: rgba(12, 12, 12, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      padding: 1.15rem;
      min-height: 520px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .col-title-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .col-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .col-indicator.orange { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .col-indicator.red { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
    .col-indicator.blue { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }
    .col-indicator.green { background: #10b981; box-shadow: 0 0 8px #10b981; }

    .col-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0;
      letter-spacing: 0.01em;
    }

    .col-counter {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      padding: 0.15rem 0.55rem;
      border-radius: 100px;
    }

    .col-orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    /* Order KDS Cards */
    .order-kds-card {
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.09);
      transition: all 0.2s ease;
      background: rgba(20, 20, 20, 0.9);
    }

    .order-kds-card:hover {
      border-color: rgba(220, 38, 38, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
    }

    .card-in-oven {
      border-color: rgba(220, 38, 38, 0.4);
      background: radial-gradient(circle at top right, rgba(220, 38, 38, 0.12) 0%, rgba(20, 20, 20, 0.9) 80%);
    }

    .card-in-transit {
      border-color: rgba(59, 130, 246, 0.35);
    }

    .card-delivered {
      opacity: 0.85;
    }

    .card-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.76rem;
    }

    .order-number {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
    }

    .order-origin-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 100px;
    }

    .origin-web { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .origin-telefono { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .origin-mostrador { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

    .order-time {
      color: #94a3b8;
    }

    .paypal-kds-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      background: rgba(0, 48, 135, 0.3);
      color: #93c5fd;
      border: 1px solid rgba(0, 121, 193, 0.5);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-pill {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .status-pill.baking { background: rgba(220, 38, 38, 0.2); color: #ef4444; border: 1px solid #ef4444; }
    .status-pill.courier { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border: 1px solid #3b82f6; }
    .status-pill.delivered { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }

    .card-pizza-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }

    .card-client-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.78rem;
      color: #cbd5e1;
    }

    .client-address.highlight {
      color: #60a5fa;
      font-weight: 600;
    }

    .kitchen-note-box {
      background: rgba(220, 38, 38, 0.1);
      border-left: 3px solid #ef4444;
      padding: 0.4rem 0.6rem;
      border-radius: 4px;
      font-size: 0.76rem;
      color: #fca5a5;
      display: flex;
      gap: 0.4rem;
      align-items: flex-start;
    }

    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      gap: 0.5rem;
    }

    .card-price {
      font-weight: 800;
      font-size: 1.05rem;
      color: #ffffff;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-action-primary {
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.78rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      color: #ffffff;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-action-primary.fire {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      box-shadow: 0 2px 10px rgba(220, 38, 38, 0.4);
    }
    .btn-action-primary.scooter {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
    }
    .btn-action-primary.success {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
    }

    .btn-action-primary:hover {
      transform: scale(1.03);
    }

    .btn-action-icon {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-radius: 8px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.78rem;
      transition: all 0.2s ease;
    }

    .btn-action-icon:hover {
      background: rgba(220, 38, 38, 0.2);
      border-color: #ef4444;
    }

    .delivered-badge {
      font-size: 0.75rem;
      color: #34d399;
      font-weight: 700;
    }

    .empty-column-state {
      padding: 3rem 1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Menú & Stock Table View */
    .stock-section, .audit-section {
      padding: 2rem 2.25rem;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 1.8rem;
      flex-wrap: wrap;
    }

    .sub-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 0.3rem;
      color: #ffffff;
    }

    .sub-desc {
      color: #94a3b8;
      font-size: 0.88rem;
      margin: 0;
    }

    .btn-back-kds {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      padding: 0.65rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-back-kds:hover {
      background: #dc2626;
      border-color: #ef4444;
      color: #ffffff;
    }

    .stock-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    .stock-table th {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stock-table td {
      padding: 1.1rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }

    .row-disabled {
      opacity: 0.55;
      background: rgba(220, 38, 38, 0.03);
    }

    .stock-pizza-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .stock-emoji {
      font-size: 1.8rem;
    }

    .pizza-name {
      display: block;
      font-size: 0.96rem;
      font-weight: 700;
    }

    .pizza-sub {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .badge-tag {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
      margin-right: 0.35rem;
    }

    .badge-tag.gold { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-tag.green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-tag.red { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

    .price-edit-cell {
      display: inline-flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 0.25rem 0.5rem;
      gap: 0.2rem;
      width: 95px;
    }

    .price-input {
      background: transparent;
      border: none;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.9rem;
      width: 100%;
      outline: none;
    }

    .stock-status-pill {
      font-size: 0.76rem;
      font-weight: 700;
      padding: 0.25rem 0.7rem;
      border-radius: 100px;
    }

    .stock-status-pill.available { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .stock-status-pill.out { background: rgba(220, 38, 38, 0.15); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.3); }

    .btn-toggle-stock {
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #34d399;
    }

    .btn-toggle-stock.btn-out {
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid #dc2626;
      color: #f87171;
    }

    /* Audit Feed */
    .audit-feed {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .audit-event-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.25rem;
      border-radius: 12px;
      background: rgba(20, 20, 20, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .audit-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #94a3b8;
      width: 75px;
      flex-shrink: 0;
    }

    .audit-type-chip {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .type-estado { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .type-creacion { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .type-cancelacion { background: rgba(220, 38, 38, 0.2); color: #f87171; border: 1px solid rgba(220, 38, 38, 0.3); }
    .type-stock { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .type-precio { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

    .audit-content {
      flex: 1;
    }

    .audit-action {
      display: block;
      font-size: 0.86rem;
      color: #ffffff;
    }

    .audit-detail {
      margin: 0.15rem 0 0;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .audit-user {
      font-size: 0.75rem;
      color: #cbd5e1;
      font-weight: 600;
    }

    /* Modal Backdrop and Card */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-card {
      width: 620px;
      max-width: 100%;
      border-radius: 20px;
      border: 1.5px solid rgba(220, 38, 38, 0.5);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(220, 38, 38, 0.25);
      overflow: hidden;
      background: #0f0f0f;
    }

    .modal-header {
      padding: 1.5rem 1.8rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, transparent 100%);
    }

    .modal-title-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .modal-icon {
      font-size: 1.8rem;
    }

    .modal-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0.2rem 0 0;
    }

    .btn-close-modal {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .btn-close-modal:hover {
      background: #dc2626;
    }

    .modal-body {
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .channel-toggle-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .channel-opt {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .channel-opt.selected {
      background: rgba(220, 38, 38, 0.18);
      border-color: #ef4444;
      color: #ffffff;
    }

    .form-input, .form-select, .form-textarea {
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0.65rem 0.95rem;
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      border-color: #ef4444;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.25);
    }

    .modal-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .price-summary {
      display: flex;
      flex-direction: column;
    }

    .sum-label {
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .sum-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ffffff;
    }

    .modal-btn-group {
      display: flex;
      gap: 0.75rem;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 0.7rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn-submit-order {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 0.7rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(220, 38, 38, 0.45);
      transition: transform 0.2s;
    }

    .btn-submit-order:hover {
      transform: translateY(-1px);
    }

    /* Shimmer Effect */
    .btn-shimmer {
      position: relative;
      overflow: hidden;
    }

    .btn-shimmer::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(60deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%);
      transform: rotate(25deg);
      animation: shimmerLoop 3.5s infinite;
    }

    @keyframes shimmerLoop {
      0% { transform: translateX(-100%) rotate(25deg); }
      100% { transform: translateX(100%) rotate(25deg); }
    }

    @keyframes pulseGlow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .kanban-board {
        grid-template-columns: repeat(2, 1fr);
      }
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }

    /* ================================================================
       ESTILOS DEL TERMINAL DE OPERACIONES KDS (STAFF AUTH ONLY)
       ================================================================ */
    .terminal-auth-wrapper {
      min-height: 82vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem 4rem;
      background: radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.08) 0%, rgba(0, 0, 0, 0.98) 75%);
    }

    .terminal-container {
      width: 100%;
      max-width: 560px;
      filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.9));
    }

    .terminal-top-bar {
      background: #111116;
      border: 1px solid rgba(220, 38, 38, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px 16px 0 0;
      padding: 0.8rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .terminal-dots {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .dot-red { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .terminal-sys-title {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .terminal-status-indicator {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .status-text {
      font-family: 'Courier New', monospace;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #ef4444;
    }

    .terminal-card {
      background: linear-gradient(180deg, #0f0f14 0%, #08080b 100%);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-top: none;
      border-radius: 0 0 16px 16px;
      padding: 2.25rem 2.25rem;
      position: relative;
    }

    .terminal-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .terminal-cyber-badge {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #fca5a5;
      text-transform: uppercase;
    }

    .terminal-protocol-pill {
      font-family: 'Courier New', monospace;
      font-size: 0.68rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #ef4444;
      font-weight: 700;
    }

    .terminal-hero {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .terminal-shield-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.1rem;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, rgba(15, 15, 20, 0.9) 80%);
      border: 2px solid rgba(239, 68, 68, 0.55);
      box-shadow: 0 0 30px rgba(220, 38, 38, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .shield-glyph {
      font-size: 1.8rem;
    }

    .terminal-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem;
      letter-spacing: -0.02em;
    }

    .terminal-desc {
      font-size: 0.88rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }

    .terminal-security-notice {
      background: rgba(220, 38, 38, 0.08);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      font-size: 0.82rem;
      color: #cbd5e1;
      line-height: 1.45;
    }

    .terminal-security-notice .notice-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .terminal-error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      color: #fee2e2;
      font-size: 0.85rem;
    }

    .terminal-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .terminal-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .terminal-label {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #cbd5e1;
      letter-spacing: 0.08em;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .t-prefix {
      color: #ef4444;
      font-weight: 900;
    }

    .terminal-input-wrap {
      background: #060608;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      transition: all 0.2s ease;
    }

    .terminal-input-wrap:focus-within {
      border-color: #ef4444;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
      background: #0a0a0e;
    }

    .terminal-input {
      background: transparent;
      border: none;
      color: #f8fafc;
      width: 100%;
      padding: 0.85rem 0.5rem;
      font-size: 0.95rem;
      outline: none;
    }

    .terminal-input.font-mono {
      font-family: 'Courier New', Courier, monospace;
      letter-spacing: 0.08em;
    }

    .btn-terminal-submit {
      width: 100%;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 10px;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.88rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(220, 38, 38, 0.45);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      margin-top: 0.35rem;
    }

    .btn-terminal-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(220, 38, 38, 0.65);
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    }

    .btn-terminal-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner-terminal {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .terminal-operator-shortcut {
      margin-top: 0.6rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      align-items: center;
    }

    .shortcut-desc {
      font-size: 0.72rem;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .btn-shortcut-chip {
      background: rgba(220, 38, 38, 0.08);
      border: 1px dashed rgba(220, 38, 38, 0.45);
      color: #fca5a5;
      border-radius: 6px;
      padding: 0.35rem 0.8rem;
      font-size: 0.76rem;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      transition: all 0.2s ease;
    }

    .btn-shortcut-chip:hover {
      background: rgba(220, 38, 38, 0.18);
      border-color: #ef4444;
      color: #ffffff;
    }

    .terminal-card-footer {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .terminal-btn-back {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.82rem;
      cursor: pointer;
      transition: color 0.2s;
      padding: 0;
    }

    .terminal-btn-back:hover {
      color: #ffffff;
      text-decoration: underline;
    }

    .terminal-foot-meta {
      font-family: 'Courier New', monospace;
      font-size: 0.66rem;
      color: #475569;
      letter-spacing: 0.06em;
    }

    /* Acciones Rápidas del Operador en Cabecera KDS */
    .operator-quick-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;
      padding-left: 0.5rem;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .operator-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 100px;
      padding: 0.35rem 0.8rem;
      font-size: 0.78rem;
      color: #cbd5e1;
    }

    .operator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 6px #22c55e;
    }

    .btn-header-public, .btn-header-lock {
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-header-public {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    .btn-header-public:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-header-lock {
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #fca5a5;
    }

    .btn-header-lock:hover {
      background: rgba(220, 38, 38, 0.25);
      color: #ffffff;
    }
  `]
})
export class AdminDashboardComponent {
  readonly pedidoService = inject(PedidoService);
  readonly authService = inject(AuthService);

  readonly irACliente = output<void>();

  // Estado del Terminal de Autenticación KDS
  readonly terminalUsername = signal<string>('admin');
  readonly terminalPassword = signal<string>('');
  readonly terminalProcesando = signal<boolean>(false);
  readonly terminalError = signal<string | null>(null);

  cargarPresetAdmin(): void {
    this.terminalUsername.set('admin');
    this.terminalPassword.set('pizza123');
    this.terminalError.set(null);
  }

  async ejecutarLoginTerminal(event?: Event): Promise<void> {
    if (event) event.preventDefault();
    const user = this.terminalUsername().trim();
    const pass = this.terminalPassword();

    if (!user || !pass) {
      this.terminalError.set('Ingresa el identificador de operador y la clave maestra.');
      return;
    }

    this.terminalProcesando.set(true);
    this.terminalError.set(null);

    try {
      const ok = await this.authService.login({
        username: user,
        password: pass,
        recordar: true
      });

      if (!ok || !this.authService.esAdmin()) {
        this.terminalError.set('Credenciales no autorizadas para el Terminal KDS. Acceso denegado.');
        if (ok && !this.authService.esAdmin()) {
          // El usuario no tiene rol administrador
          this.authService.logout();
        }
      } else {
        this.terminalPassword.set('');
        this.terminalError.set(null);
      }
    } catch (e: any) {
      this.terminalError.set('Error en el motor de autenticación. Intenta nuevamente.');
    } finally {
      this.terminalProcesando.set(false);
    }
  }

  cerrarSesionAdmin(): void {
    this.authService.logout();
  }

  // Estado de vistas internas del panel
  readonly vistaActual = signal<'kds' | 'menu_stock' | 'auditoria'>('kds');

  // Filtros y búsqueda
  readonly busquedaTexto = signal<string>('');
  readonly filtroOrigen = signal<'TODOS' | 'WEB' | 'TELEFONO' | 'MOSTRADOR'>('TODOS');

  // Modal Manual
  readonly modalManualAbierto = signal<boolean>(false);
  readonly manualOrigen = signal<'MOSTRADOR' | 'TELEFONO'>('MOSTRADOR');
  readonly manualClienteNombre = signal<string>('');
  readonly manualCorreo = signal<string>('');
  readonly manualSabor = signal<string>('Pepperoni Clásica Byte');
  readonly manualTamano = signal<string>('Grande Familiar');
  readonly manualDireccion = signal<string>('');
  readonly manualNotas = signal<string>('');

  cambiarVista(vista: 'kds' | 'menu_stock' | 'auditoria'): void {
    this.vistaActual.set(vista);
  }

  // Filtrado de Pedidos según búsqueda y canal
  readonly pedidosFiltrados = computed(() => {
    const texto = this.busquedaTexto().trim().toLowerCase();
    const origen = this.filtroOrigen();

    return this.pedidoService.pedidos().filter(pedido => {
      // Filtro origen
      if (origen !== 'TODOS') {
        const pOrigen = pedido.origen || 'WEB';
        if (pOrigen !== origen) return false;
      }

      // Filtro texto
      if (!texto) return true;
      const coincideId = pedido.id?.toString().includes(texto);
      const coincideSabor = pedido.saborPizza?.toLowerCase().includes(texto);
      const coincideCorreo = pedido.correoCliente?.toLowerCase().includes(texto);
      const coincideCliente = pedido.clienteNombre?.toLowerCase().includes(texto);

      return coincideId || coincideSabor || coincideCorreo || coincideCliente;
    });
  });

  // Columnas Kanban
  readonly pedidosRecibidos = computed(() =>
    this.pedidosFiltrados().filter(p => p.estado === 'CONFIRMADO' || p.estado === 'CREADO')
  );

  readonly pedidosHorneando = computed(() =>
    this.pedidosFiltrados().filter(p => p.estado === 'EN_HORNO')
  );

  readonly pedidosRepartiendo = computed(() =>
    this.pedidosFiltrados().filter(p => p.estado === 'EN_CAMINO')
  );

  readonly pedidosCompletados = computed(() =>
    this.pedidosFiltrados().filter(p => p.estado === 'ENTREGADO')
  );

  // KPIs
  readonly totalVentas = computed(() => {
    return this.pedidoService.pedidos()
      .filter(p => p.estado !== 'CANCELADO')
      .reduce((sum, p) => sum + (p.precioTotal || 13.99), 0);
  });

  readonly pedidosEnCocina = computed(() =>
    this.pedidoService.pedidos().filter(p => p.estado === 'CONFIRMADO' || p.estado === 'EN_HORNO').length
  );

  readonly pedidosEnReparto = computed(() =>
    this.pedidoService.pedidos().filter(p => p.estado === 'EN_CAMINO').length
  );

  readonly pedidosEntregados = computed(() =>
    this.pedidoService.pedidos().filter(p => p.estado === 'ENTREGADO').length
  );

  readonly tasaCumplimiento = computed(() => {
    const total = this.pedidoService.pedidos().length;
    if (total === 0) return 100;
    const entregados = this.pedidosEntregados();
    return Math.round((entregados / total) * 100);
  });

  // Acciones en 1 Clic
  async cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): Promise<void> {
    if (!pedido.id) return;
    const operador = this.authService.usuarioActual()?.nombre || 'Administrador PizzaByte';
    await this.pedidoService.actualizarEstadoPedido(pedido.id, nuevoEstado, operador, true);
  }

  eliminarOrden(pedido: Pedido): void {
    if (!pedido.id) return;
    if (confirm(`¿Seguro que deseas cancelar la orden #${pedido.id} de ${pedido.saborPizza}?`)) {
      const operador = this.authService.usuarioActual()?.nombre || 'Administrador PizzaByte';
      this.pedidoService.eliminarPedido(pedido.id, operador);
    }
  }

  alternarStock(pizzaId: string): void {
    const operador = this.authService.usuarioActual()?.nombre || 'Administrador PizzaByte';
    this.pedidoService.alternarDisponibilidadPizza(pizzaId, operador);
  }

  actualizarPrecio(pizzaId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevoPrecio = parseFloat(input.value);
    if (!isNaN(nuevoPrecio) && nuevoPrecio > 0) {
      const operador = this.authService.usuarioActual()?.nombre || 'Administrador PizzaByte';
      this.pedidoService.actualizarPrecioPizza(pizzaId, nuevoPrecio, operador);
    }
  }

  // Modal Manual
  abrirModalPedidoManual(): void {
    this.manualClienteNombre.set('');
    this.manualCorreo.set('');
    this.manualNotas.set('');
    this.manualDireccion.set('');
    this.manualOrigen.set('MOSTRADOR');
    this.modalManualAbierto.set(true);
  }

  cerrarModalManual(): void {
    this.modalManualAbierto.set(false);
  }

  calcularPrecioManual(): number {
    const sabor = this.manualSabor();
    const pizza = this.pedidoService.catalogoPizzasModificable().find(p => p.nombre === sabor);
    let base = pizza ? pizza.precio : 13.99;

    if (this.manualTamano() === 'Grande Familiar') base += 3.00;
    if (this.manualTamano() === 'Personal Gourmet') base -= 2.00;

    return Number(base.toFixed(2));
  }

  confirmarPedidoManual(event: Event): void {
    event.preventDefault();
    const operador = this.authService.usuarioActual()?.nombre || 'Administrador PizzaByte';

    this.pedidoService.crearPedidoManual({
      saborPizza: this.manualSabor(),
      correoCliente: this.manualCorreo() || 'mostrador@pizzabyte.com',
      clienteNombre: this.manualClienteNombre() || 'Cliente en Local',
      origen: this.manualOrigen(),
      tamano: this.manualTamano(),
      direccionEntrega: this.manualOrigen() === 'TELEFONO' ? this.manualDireccion() : 'Retiro en Local',
      notasCocina: this.manualNotas(),
      precioTotal: this.calcularPrecioManual()
    }, operador);

    this.cerrarModalManual();
  }
}
