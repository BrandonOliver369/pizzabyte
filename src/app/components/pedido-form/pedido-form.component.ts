import { Component, inject, signal, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { PaypalService } from '../../services/paypal.service';
import { AuthService } from '../../services/auth.service';
import { SaborPizza, Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedido-form',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay-bg" (click)="cerrar.emit()">
      <div class="modal-order-box animate-pop-in" (click)="$event.stopPropagation()">
        <!-- Botón de Cerrar Modal -->
        <button class="btn-modal-close" (click)="cerrar.emit()" type="button" title="Cerrar ventana">✕</button>

        <div class="modal-order-grid">
          <!-- Columna Izquierda: Showcase Culinario Interactivo & Resumen -->
          <aside class="order-visual-panel">
            <div class="visual-header">
              <span class="panel-eyebrow">SELEZIONE D'AUTORE • PIZZABYTE</span>
              <h3 class="panel-pizza-name">{{ pizzaActual()?.nombre }}</h3>
              @if (pizzaActual()?.subtituloItaliano) {
                <span class="panel-pizza-sub">{{ pizzaActual()?.subtituloItaliano }}</span>
              }
            </div>

            <!-- Escaparate Interactivo de la Pizza con Escala Dinámica y Efectos -->
            <div class="pizza-showcase-stage">
              <div 
                class="pizza-photo-frame" 
                [style.transform]="obtenerEscalaPizza()">
                @if (pizzaActual()?.fotoUrl) {
                  <img [src]="pizzaActual()?.fotoUrl" [alt]="pizzaActual()?.nombre" class="panel-pizza-img animate-float-slow" />
                } @else {
                  <div class="panel-emoji">{{ pizzaActual()?.imagen || '🍕' }}</div>
                }
                
                <!-- Borde Relleno Fior di Latte (Glow Ring) -->
                @if (masaSeleccionada() === 'borde_queso') {
                  <div class="stuffed-crust-ring animate-pulse-slow" title="Borde Relleno Fior di Latte Activo"></div>
                }
                <div class="photo-glow-ring"></div>
              </div>

              <!-- Medidor de Diámetro Dinámico -->
              <div class="interactive-diameter-pill animate-fade-in">
                <span class="diameter-icon">📏</span>
                <span>{{ obtenerBadgeTamano() }}</span>
              </div>

              <!-- Dock de Toppings Extra Activos (Flotantes) -->
              <div class="active-toppings-dock">
                @if (extraQueso()) { <span class="dock-chip animate-pop-in">🧀 +Fior di Latte</span> }
                @if (extraChampinones()) { <span class="dock-chip animate-pop-in">🍄 +Champiñones</span> }
                @if (extraJalapenos()) { <span class="dock-chip animate-pop-in">🌶️ +Jalapeños</span> }
                @if (extraTocino()) { <span class="dock-chip animate-pop-in">🥓 +Tocino</span> }
                @if (extraTrufa()) { <span class="dock-chip animate-pop-in">✨ +Trufa</span> }
              </div>
            </div>

            <div class="panel-tags-box">
              <span class="p-tag">🌾 Masa Madre 48h</span>
              <span class="p-tag">🔥 Forno a 400°C</span>
              <span class="p-tag">🧀 Fior di Latte DOP</span>
            </div>

            @if (pizzaActual()?.maridajeRecomendado) {
              <div class="panel-wine-card">
                <span class="wine-icon">🍷</span>
                <div class="wine-text">
                  <span class="wine-label">Maridaje de Autor:</span>
                  <span class="wine-val">{{ pizzaActual()?.maridajeRecomendado }}</span>
                </div>
              </div>
            }

            <!-- Resumen de Costos en Vivo Integrado -->
            <div class="panel-cost-receipt">
              <div class="receipt-row">
                <span>Dimensión:</span>
                <strong class="receipt-highlight">{{ obtenerNombreTamano() }}</strong>
              </div>
              <div class="receipt-row">
                <span>Masa:</span>
                <span>{{ obtenerNombreMasa() }}</span>
              </div>
              @if (obtenerExtrasTexto()) {
                <div class="receipt-row">
                  <span>Extras:</span>
                  <span class="text-extras">{{ obtenerExtrasTexto() }}</span>
                </div>
              }
              <div class="receipt-row">
                <span>Envío express artesanal:</span>
                <span class="text-free">GRATIS ($0.00)</span>
              </div>
              <div class="receipt-total-row">
                <span>Total:</span>
                <span class="receipt-price">\${{ calcularPrecio() | number:'1.2-2' }} <small class="currency-tag">USD</small></span>
              </div>
            </div>
          </aside>

          <!-- Columna Derecha: Controles Minimalistas por Pasos (Sin Desbordes) -->
          <section class="order-form-panel">
            
            <!-- Barra de Navegación por Pasos Minimalista -->
            <div class="steps-nav-header">
              <div class="steps-tab-bar">
                <button 
                  type="button" 
                  class="step-tab-btn" 
                  [class.active]="pasoActual() === 1"
                  (click)="pasoActual.set(1)">
                  <span class="step-num">1</span>
                  <span class="step-title">Tu Pizza Gourmet</span>
                </button>

                <div class="step-tab-arrow">→</div>

                <button 
                  type="button" 
                  class="step-tab-btn" 
                  [class.active]="pasoActual() === 2"
                  (click)="irAPaso2()">
                  <span class="step-num">2</span>
                  <span class="step-title">Pago & Entrega</span>
                  @if (metodoPagoSeleccionado() === 'PAYPAL') {
                    <span class="tab-pp-badge">🅿️</span>
                  }
                </button>
              </div>
            </div>

            <!-- ============================================================ -->
            <!-- PASO 1: PERSONALIZACIÓN DE LA PIZZA (INTERACTIVO & MINIMALISTA) -->
            <!-- ============================================================ -->
            @if (pasoActual() === 1) {
              <div class="step-content-box animate-fade-in">
                
                <!-- 1. Selección de Sabor -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">1</span>
                    <span class="section-label-text">Sabor de Autor</span>
                    <span class="badge-req">* Requerido</span>
                  </div>
                  <div class="select-wrapper-minimal">
                    <select 
                      id="saborPizza" 
                      name="saborPizza"
                      [(ngModel)]="saborSeleccionado" 
                      (ngModelChange)="onSaborChange($event)"
                      class="form-select-minimal"
                      required>
                      @for (pizza of pedidoService.catalogoPizzas; track pizza.id) {
                        <option [value]="pizza.nombre">
                          {{ pizza.nombre }} — \${{ pizza.precio | number:'1.2-2' }} USD
                        </option>
                      }
                      <option value="OTRO">✏️ Otro sabor personalizado...</option>
                    </select>
                  </div>

                  @if (esSaborPersonalizado()) {
                    <div class="custom-flavor-input animate-fade-in">
                      <input 
                        type="text" 
                        [(ngModel)]="saborPersonalizadoTexto" 
                        name="saborPersonalizado"
                        placeholder="Describe tu combinación de ingredientes..."
                        class="form-input-minimal"
                        required />
                    </div>
                  }
                </div>

                <!-- 2. Dimensión & Tamaño con Escala Visual -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">2</span>
                    <span class="section-label-text">Dimensión & Tamaño</span>
                    <span class="section-hint-badge">Escala la pizza en vivo</span>
                  </div>
                  <div class="size-cards-row">
                    @for (tam of tamanos; track tam.id) {
                      <button 
                        type="button"
                        class="size-card-btn" 
                        [class.active]="tamanoSeleccionado() === tam.id"
                        (click)="seleccionarTamano(tam.id)">
                        <div class="size-radio-indicator">
                          <span class="radio-inner"></span>
                        </div>
                        <div class="size-card-info">
                          <strong class="size-card-name">{{ tam.nombre }}</strong>
                          <span class="size-card-meta">{{ tam.detalle }}</span>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- 3. Tipo de Masa (Impasto) -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">3</span>
                    <span class="section-label-text">Tipo de Masa (Impasto)</span>
                  </div>
                  <div class="crust-cards-row">
                    <button 
                      type="button"
                      class="crust-card-btn" 
                      [class.active]="masaSeleccionada() === 'tradicional'"
                      (click)="masaSeleccionada.set('tradicional')">
                      <span class="crust-card-title">Napolitana Tradicional</span>
                      <span class="crust-card-sub">Maduración 48h (Incluida)</span>
                    </button>

                    <button 
                      type="button"
                      class="crust-card-btn" 
                      [class.active]="masaSeleccionada() === 'borde_queso'"
                      (click)="masaSeleccionada.set('borde_queso')">
                      <span class="crust-card-title">Borde Relleno Fior di Latte</span>
                      <span class="crust-card-sub highlight-gold">+ $2.50 USD</span>
                    </button>

                    <button 
                      type="button"
                      class="crust-card-btn" 
                      [class.active]="masaSeleccionada() === 'fina'"
                      (click)="masaSeleccionada.set('fina')">
                      <span class="crust-card-title">Crocante al Carbón</span>
                      <span class="crust-card-sub">Fina & Crocante (Incluida)</span>
                    </button>
                  </div>
                </div>

                <!-- 4. Toppings Gourmet Extra -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">4</span>
                    <span class="section-label-text">Ingredientes Gourmet Extra</span>
                    <span class="section-sub-label">Opcional</span>
                  </div>
                  <div class="toppings-pills-wrap">
                    <button 
                      type="button"
                      class="topping-chip-btn"
                      [class.active]="extraQueso()"
                      (click)="extraQueso.set(!extraQueso())">
                      <span class="chip-toggle-icon">{{ extraQueso() ? '✓' : '+' }}</span>
                      <span>Extra Fior di Latte (+$1.50)</span>
                    </button>
                    <button 
                      type="button"
                      class="topping-chip-btn"
                      [class.active]="extraChampinones()"
                      (click)="extraChampinones.set(!extraChampinones())">
                      <span class="chip-toggle-icon">{{ extraChampinones() ? '✓' : '+' }}</span>
                      <span>Champiñones (+$1.00)</span>
                    </button>
                    <button 
                      type="button"
                      class="topping-chip-btn"
                      [class.active]="extraJalapenos()"
                      (click)="extraJalapenos.set(!extraJalapenos())">
                      <span class="chip-toggle-icon">{{ extraJalapenos() ? '✓' : '+' }}</span>
                      <span>Jalapeños (+$0.80)</span>
                    </button>
                    <button 
                      type="button"
                      class="topping-chip-btn"
                      [class.active]="extraTocino()"
                      (click)="extraTocino.set(!extraTocino())">
                      <span class="chip-toggle-icon">{{ extraTocino() ? '✓' : '+' }}</span>
                      <span>Tocino Ahumado (+$1.20)</span>
                    </button>
                    <button 
                      type="button"
                      class="topping-chip-btn"
                      [class.active]="extraTrufa()"
                      (click)="extraTrufa.set(!extraTrufa())">
                      <span class="chip-toggle-icon">{{ extraTrufa() ? '✓' : '+' }}</span>
                      <span>Aceite Trufa Blanca (+$1.75)</span>
                    </button>
                  </div>
                </div>

                <!-- Botón de Avance a Paso 2 -->
                <div class="step-footer-cta">
                  <button 
                    type="button" 
                    class="btn-step-advance btn-shimmer"
                    (click)="irAPaso2()"
                    [disabled]="!obtenerNombreSaborFinal()">
                    <span class="btn-cta-text">Continuar a Pago & Entrega</span>
                    <span class="btn-cta-price">\${{ calcularPrecio() | number:'1.2-2' }} USD →</span>
                  </button>
                </div>

              </div>
            }

            <!-- ============================================================ -->
            <!-- PASO 2: ENTREGA & MÉTODO DE PAGO (PAYPAL / TARJETA / EFECTIVO) -->
            <!-- ============================================================ -->
            @if (pasoActual() === 2) {
              <div class="step-content-box animate-fade-in">
                
                <!-- 1. Correo Electrónico del Cliente -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">1</span>
                    <span class="section-label-text">Correo para Confirmación y Seguimiento</span>
                    <span class="badge-req">* Requerido</span>
                  </div>
                  <div class="input-with-icon-minimal">
                    <span class="input-icon">✉️</span>
                    <input 
                      type="email" 
                      [(ngModel)]="correoCliente"
                      (ngModelChange)="onCorreoClienteChange()"
                      name="correoCliente"
                      placeholder="tucorreo@ejemplo.com"
                      class="form-input-minimal"
                      required />
                  </div>
                  <span class="field-hint-clean">
                    📧 Despacho automático de factura vía <strong>Brevo API v3</strong> y KDS de Cocina.
                  </span>
                </div>

                <!-- 2. Selección de Método de Pago -->
                <div class="form-section-minimal">
                  <div class="section-label-row">
                    <span class="section-label-num">2</span>
                    <span class="section-label-text">Selecciona tu Método de Pago</span>
                  </div>

                  <div class="payment-tabs-row">
                    <!-- Opción 1: PayPal -->
                    <button 
                      type="button" 
                      class="pay-selector-card"
                      [class.active]="metodoPagoSeleccionado() === 'PAYPAL'"
                      (click)="seleccionarMetodoPago('PAYPAL')">
                      <div class="pay-selector-header">
                        <span class="pay-svg-icon">
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#003087" d="M20.067 8.478c.492.315.844.82 1.008 1.455.334 1.29-.028 3.125-1.082 4.412-1.22 1.492-3.142 2.195-5.342 2.195H11.51l-.97 6.13-.03.193H7.07l.03-.193 2.766-17.525.03-.193h6.643c2.404 0 4.195.53 5.01 1.748.243.364.394.803.435 1.272l.073.508z"/>
                            <path fill="#0079C1" d="M8.94 13.91l1.597-10.12h6.643c2.404 0 4.195.53 5.01 1.748.243.364.394.803.435 1.272l.073.508c.492.315.844.82 1.008 1.455.334 1.29-.028 3.125-1.082 4.412-1.22 1.492-3.142 2.195-5.342 2.195H14.13l-.847 5.352-.03.193H8.94z"/>
                            <path fill="#00457C" d="M14.13 15.38h-2.62l.97-6.13h2.62c2.2 0 4.122-.703 5.342-2.195 1.054-1.287 1.416-3.122 1.082-4.412-.164-.635-.516-1.14-1.008-1.455l-.073-.508c-.041-.47-.192-.908-.435-1.272-.815-1.218-2.606-1.748-5.01-1.748H8.36L5.594 15.187l-.03.193h3.376l-.03-.193 1.597-10.12h3.623c2.2 0 4.122.703 5.342 2.195 1.054 1.287 1.416 3.122 1.082 4.412-.164.635-.516 1.14-1.008 1.455l-.073.508c-.041.47-.192.908-.435 1.272-.815 1.218-2.606 1.748-5.01 1.748h-.22z"/>
                          </svg>
                        </span>
                        <strong class="pay-name">PayPal</strong>
                      </div>
                      <span class="pay-tag-sub">Inmediato & Seguro</span>
                      <span class="pay-highlight-badge">⭐ VIP</span>
                    </button>

                    <!-- Opción 2: Tarjeta -->
                    <button 
                      type="button" 
                      class="pay-selector-card"
                      [class.active]="metodoPagoSeleccionado() === 'TARJETA'"
                      (click)="seleccionarMetodoPago('TARJETA')">
                      <div class="pay-selector-header">
                        <span class="pay-emoji">💳</span>
                        <strong class="pay-name">Tarjeta</strong>
                      </div>
                      <span class="pay-tag-sub">Crédito / Débito</span>
                    </button>

                    <!-- Opción 3: Efectivo -->
                    <button 
                      type="button" 
                      class="pay-selector-card"
                      [class.active]="metodoPagoSeleccionado() === 'EFECTIVO'"
                      (click)="seleccionarMetodoPago('EFECTIVO')">
                      <div class="pay-selector-header">
                        <span class="pay-emoji">💵</span>
                        <strong class="pay-name">Efectivo</strong>
                      </div>
                      <span class="pay-tag-sub">Contra entrega</span>
                    </button>
                  </div>
                </div>

                <!-- ======================================================== -->
                <!-- ACCIONES DE PAGO SEGÚN MÉTODO ELEGIDO (SIN BOTONES DUPLICADOS) -->
                <!-- ======================================================== -->

                <!-- CASO A: PAYPAL SMART BUTTONS OFICIALES SDK -->
                @if (metodoPagoSeleccionado() === 'PAYPAL') {
                  <div class="paypal-flow-card animate-fade-in">
                    <div class="paypal-card-top">
                      <div class="paypal-lock-info">
                        <span class="lock-dot"></span>
                        <span>Pasarela Oficial PayPal SDK v5</span>
                      </div>
                      <span class="buyer-protection-pill">🛡️ Protección al Comprador</span>
                    </div>

                    <!-- Indicador de Estado del SDK Oficial -->
                    <div class="paypal-status-badge">
                      <div class="status-left">
                        <span class="status-indicator-dot"></span>
                        <span class="status-text">Client ID Conectado: <strong>...{{ paypalService.paypalClientId().slice(-10) }}</strong></span>
                      </div>
                      <button type="button" class="btn-toggle-client-id" (click)="mostrarConfigPaypal.set(!mostrarConfigPaypal())">
                        ⚙️ {{ mostrarConfigPaypal() ? 'Cerrar' : 'Configurar' }}
                      </button>
                    </div>

                    @if (mostrarConfigPaypal()) {
                      <div class="paypal-config-box animate-fade-in">
                        <label class="pp-config-label">Tu PayPal Client ID (developer.paypal.com):</label>
                        <div class="pp-config-input-row">
                          <input 
                            type="text" 
                            [(ngModel)]="paypalClientIdInput" 
                            placeholder="Client ID Sandbox o Live"
                            class="pp-config-input" />
                          <button type="button" class="btn-save-pp-id" (click)="guardarNuevoPaypalId()">Actualizar</button>
                        </div>
                        <p class="pp-config-help">Conexión directa con la API REST v2 de PayPal.</p>
                      </div>
                    }

                    <!-- Alerta si falta el correo -->
                    @if (!correoCliente) {
                      <div class="paypal-warning-box animate-fade-in">
                        <span>⚠️ Ingresa tu correo electrónico arriba para habilitar los botones oficiales de PayPal.</span>
                      </div>
                    }

                    <!-- CONTENEDOR OFICIAL DE SMART BUTTONS DE PAYPAL -->
                    <div class="paypal-real-buttons-wrapper">
                      @if (paypalService.cargandoSdk() || renderizandoBotonesPaypal()) {
                        <div class="paypal-loading-skeleton">
                          <span class="spinner-clean"></span>
                          <span>Cargando Smart Buttons Seguros de PayPal...</span>
                        </div>
                      }
                      
                      <div id="paypal-smart-button-container" [style.display]="(!correoCliente || renderizandoBotonesPaypal()) ? 'none' : 'block'"></div>
                    </div>

                    <div class="paypal-express-fallback-row">
                      <button type="button" class="btn-paypal-express-fallback" (click)="abrirModalPaypal()">
                        ⚡ O pagar con modal express de prueba
                      </button>
                    </div>

                    <p class="paypal-clean-caption">
                      Al presionar el botón oficial de PayPal autorizarás tu orden con saldo PayPal o tarjeta vinculada.
                    </p>
                  </div>
                }

                <!-- CASO B: BOTÓN CONFIRMAR DIRECTO PARA TARJETA O EFECTIVO -->
                @if (metodoPagoSeleccionado() !== 'PAYPAL') {
                  <div class="standard-flow-card animate-fade-in">
                    <button 
                      type="button" 
                      class="btn-confirm-standard btn-shimmer"
                      (click)="enviarPedido()"
                      [disabled]="!correoCliente || pedidoService.procesando()">
                      @if (pedidoService.procesando()) {
                        <span class="spinner-clean"></span>
                        <span>Procesando Pedido & Despachando...</span>
                      } @else {
                        <span class="btn-icon">🚀</span>
                        <span>Confirmar Pedido ({{ metodoPagoSeleccionado() === 'EFECTIVO' ? 'Efectivo al Recibir' : 'Tarjeta Débito/Crédito' }})</span>
                        <span class="btn-total-pill">\${{ calcularPrecio() | number:'1.2-2' }} USD</span>
                      }
                    </button>
                  </div>
                }

                <!-- Botón para Regresar al Paso 1 -->
                <div class="step-back-row">
                  <button type="button" class="btn-step-back-link" (click)="pasoActual.set(1)">
                    ← Volver a modificar sabor, tamaño o ingredientes
                  </button>
                </div>

              </div>
            }

          </section>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL OFICIAL CHECKOUT DE PAYPAL (ALTA FIDELIDAD)             -->
      <!-- ============================================================ -->
      @if (modalPaypalAbierto()) {
        <div class="paypal-modal-overlay animate-fade-in" (click)="cerrarModalPaypal()">
          <div class="paypal-modal-window animate-pop-in" (click)="$event.stopPropagation()">
            <button type="button" class="btn-paypal-close" (click)="cerrarModalPaypal()" title="Cancelar pago con PayPal">✕</button>

            <!-- Encabezado Estilo PayPal -->
            <div class="pp-header">
              <div class="pp-logo-wrap">
                <span class="pp-logo-p1">P</span><span class="pp-logo-p2">P</span>
                <span class="pp-brand-name">PayPal</span>
              </div>
              <div class="pp-secure-badge">
                <span class="pp-lock-icon">🔒</span>
                <span>256-bit SSL</span>
              </div>
            </div>

            <!-- Resumen de Factura PayPal -->
            <div class="pp-order-summary-box">
              <div class="pp-merchant-info">
                <span class="pp-merchant-label">Comercio Verificado:</span>
                <strong class="pp-merchant-name">PizzaByte Gourmet Inc.</strong>
              </div>

              <div class="pp-item-row">
                <div>
                  <strong class="pp-item-title">{{ obtenerNombreSaborFinal() }}</strong>
                  <span class="pp-item-meta">{{ obtenerNombreTamano() }} • {{ obtenerNombreMasa() }}</span>
                </div>
                <strong class="pp-item-amount">\${{ calcularPrecio() | number:'1.2-2' }} USD</strong>
              </div>

              <div class="pp-divider"></div>

              <div class="pp-total-row">
                <span>Total a pagar</span>
                <span class="pp-total-highlight">\${{ calcularPrecio() | number:'1.2-2' }} USD</span>
              </div>
            </div>

            <!-- Selección de Fuente de Fondos PayPal -->
            <div class="pp-funding-sources">
              <span class="pp-funding-title">Selecciona fuente de fondos:</span>
              
              <label class="pp-funding-option" [class.selected]="fuenteFondosPaypal === 'saldo'">
                <input type="radio" name="ppFuente" value="saldo" [(ngModel)]="fuenteFondosPaypal" />
                <div class="pp-option-content">
                  <span class="pp-option-title">Saldo de PayPal</span>
                  <span class="pp-option-sub">Disponible: $280.00 USD</span>
                </div>
                <span class="pp-check-mark">✓</span>
              </label>

              <label class="pp-funding-option" [class.selected]="fuenteFondosPaypal === 'tarjeta'">
                <input type="radio" name="ppFuente" value="tarjeta" [(ngModel)]="fuenteFondosPaypal" />
                <div class="pp-option-content">
                  <span class="pp-option-title">Visa Débito •••• 4242</span>
                  <span class="pp-option-sub">Vinculada a tu cuenta PayPal</span>
                </div>
                <span class="pp-check-mark">✓</span>
              </label>
            </div>

            <!-- Datos de confirmación del comprador -->
            <div class="pp-buyer-box">
              <span class="pp-buyer-label">Cuenta PayPal del Comprador:</span>
              <input 
                type="email" 
                [(ngModel)]="paypalEmailComprador" 
                placeholder="cliente@paypal.com"
                class="pp-buyer-input" />
            </div>

            <!-- Botón de Ejecutar Pago -->
            <div class="pp-actions-footer">
              <button 
                type="button" 
                class="btn-pp-complete-payment btn-shimmer"
                (click)="completarPagoPaypal()"
                [disabled]="procesandoPagoPaypal()">
                @if (procesandoPagoPaypal()) {
                  <span class="pp-spinner"></span>
                  <span>Autorizando Transacción PayPal...</span>
                } @else {
                  <span>Pagar \${{ calcularPrecio() | number:'1.2-2' }} USD con PayPal</span>
                }
              </button>

              <button type="button" class="btn-pp-cancel" (click)="cerrarModalPaypal()">
                Cancelar y volver a PizzaByte
              </button>
            </div>

            <div class="pp-legal-footer">
              <span>🛡️ Tu información financiera nunca se comparte con el vendedor. Respaldado por Protección al Comprador de PayPal.</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ================================================================= */
    /* MODAL DE PEDIDO ULTRA ELEGANTE & MINIMALISTA - NEGRO, ROJO & BLANCO*/
    /* ================================================================= */
    .modal-overlay-bg {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-order-box {
      background: #080808;
      border: 1px solid rgba(220, 38, 38, 0.35);
      border-radius: 24px;
      max-width: 980px;
      width: 100%;
      max-height: 88vh;
      overflow: hidden;
      box-shadow: 0 35px 90px rgba(0, 0, 0, 0.98), 0 0 45px rgba(220, 38, 38, 0.15);
      position: relative;
    }

    .btn-modal-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 10;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-modal-close:hover {
      background: #dc2626;
      border-color: #dc2626;
      transform: rotate(90deg);
    }

    .modal-order-grid {
      display: grid;
      grid-template-columns: 380px 1fr;
      height: 88vh;
      max-height: 88vh;
      overflow: hidden;
    }

    /* ================================================================= */
    /* COLUMNA IZQUIERDA: SHOWCASE CULINARIO INTERACTIVO                 */
    /* ================================================================= */
    .order-visual-panel {
      background: radial-gradient(circle at 50% 30%, rgba(220, 38, 38, 0.12) 0%, #050505 85%);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2rem 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-y: auto;
      scrollbar-width: none;
    }

    .order-visual-panel::-webkit-scrollbar {
      display: none;
    }

    .visual-header {
      text-align: center;
    }

    .panel-eyebrow {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 2px;
      color: #dc2626;
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.25rem;
    }

    .panel-pizza-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.2rem;
      line-height: 1.2;
    }

    .panel-pizza-sub {
      font-size: 0.78rem;
      color: #ef4444;
      font-style: italic;
    }

    /* Showcase Stage */
    .pizza-showcase-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 1rem 0;
      position: relative;
    }

    .pizza-photo-frame {
      width: 175px;
      height: 175px;
      border-radius: 50%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .panel-pizza-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 16px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(220, 38, 38, 0.25);
    }

    .panel-emoji {
      font-size: 6rem;
    }

    .stuffed-crust-ring {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 3px solid #ffc439;
      box-shadow: 0 0 20px rgba(255, 196, 57, 0.6);
      pointer-events: none;
    }

    .interactive-diameter-pill {
      margin-top: 0.85rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .active-toppings-dock {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      justify-content: center;
      margin-top: 0.65rem;
      min-height: 24px;
    }

    .dock-chip {
      background: rgba(220, 38, 38, 0.18);
      border: 1px solid rgba(220, 38, 38, 0.5);
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }

    .panel-tags-box {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .p-tag {
      font-size: 0.68rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .panel-wine-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.6rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
    }

    .wine-icon {
      font-size: 1.1rem;
    }

    .wine-text {
      display: flex;
      flex-direction: column;
    }

    .wine-label {
      font-size: 0.62rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .wine-val {
      font-size: 0.74rem;
      color: #ffffff;
      font-weight: 600;
    }

    /* Live Cost Receipt */
    .panel-cost-receipt {
      background: rgba(14, 14, 14, 0.85);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 16px;
      padding: 0.95rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.76rem;
      color: #94a3b8;
    }

    .receipt-highlight {
      color: #ffffff;
      font-weight: 600;
    }

    .text-extras {
      color: #ef4444;
      font-weight: 600;
      max-width: 170px;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .text-free {
      color: #22c55e;
      font-weight: 700;
    }

    .receipt-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
    }

    .receipt-price {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.45rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .currency-tag {
      font-family: system-ui, sans-serif;
      font-size: 0.72rem;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 0.5px;
    }

    /* ================================================================= */
    /* COLUMNA DERECHA: FLUJO POR PASOS MINIMALISTA                      */
    /* ================================================================= */
    .order-form-panel {
      padding: 2rem 2.25rem;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(220, 38, 38, 0.4) transparent;
    }

    .order-form-panel::-webkit-scrollbar {
      width: 5px;
    }

    .order-form-panel::-webkit-scrollbar-thumb {
      background: rgba(220, 38, 38, 0.4);
      border-radius: 9999px;
    }

    /* Steps Tab Bar */
    .steps-nav-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1.15rem;
    }

    .steps-tab-bar {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.35rem 0.5rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .step-tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      padding: 0.6rem 1rem;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .step-tab-btn:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.04);
    }

    .step-tab-btn.active {
      background: rgba(220, 38, 38, 0.15);
      border-color: rgba(220, 38, 38, 0.45);
      color: #ffffff;
    }

    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.74rem;
      font-weight: 800;
    }

    .step-tab-btn.active .step-num {
      background: #dc2626;
      color: #ffffff;
    }

    .step-title {
      font-size: 0.85rem;
      font-weight: 700;
    }

    .tab-pp-badge {
      font-size: 0.85rem;
      margin-left: 0.2rem;
    }

    .step-tab-arrow {
      color: #475569;
      font-size: 0.9rem;
    }

    /* Secciones Minimalistas */
    .step-content-box {
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
    }

    .form-section-minimal {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .section-label-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-label-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-label-text {
      font-size: 0.84rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.2px;
    }

    .badge-req {
      font-size: 0.65rem;
      color: #ef4444;
      font-weight: 600;
    }

    .section-hint-badge {
      font-size: 0.68rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      margin-left: auto;
    }

    .section-sub-label {
      font-size: 0.72rem;
      color: #64748b;
      margin-left: auto;
    }

    /* Inputs & Selects Minimalistas */
    .select-wrapper-minimal {
      position: relative;
    }

    .form-select-minimal {
      width: 100%;
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .form-select-minimal:focus {
      border-color: #dc2626;
      box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
    }

    .form-input-minimal {
      width: 100%;
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      color: #ffffff;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s;
    }

    .form-input-minimal:focus {
      border-color: #dc2626;
      box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
    }

    .input-with-icon-minimal {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon-minimal .input-icon {
      position: absolute;
      left: 1rem;
      font-size: 1rem;
      pointer-events: none;
    }

    .input-with-icon-minimal input {
      padding-left: 2.8rem;
    }

    .field-hint-clean {
      font-size: 0.74rem;
      color: #94a3b8;
      margin-top: 0.2rem;
    }

    /* Tarjetas de Tamaño Interactivas */
    .size-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
    }

    .size-card-btn {
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.8rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .size-card-btn:hover {
      background: #161616;
      border-color: rgba(220, 38, 38, 0.4);
      transform: translateY(-2px);
    }

    .size-card-btn.active {
      background: rgba(220, 38, 38, 0.12);
      border-color: #dc2626;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.25);
    }

    .size-radio-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1.5px solid #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .size-card-btn.active .size-radio-indicator {
      border-color: #dc2626;
    }

    .radio-inner {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: transparent;
      transition: background 0.2s;
    }

    .size-card-btn.active .radio-inner {
      background: #dc2626;
    }

    .size-card-info {
      display: flex;
      flex-direction: column;
    }

    .size-card-name {
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .size-card-meta {
      color: #94a3b8;
      font-size: 0.68rem;
    }

    /* Tarjetas de Masa (Impasto) */
    .crust-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
    }

    .crust-card-btn {
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.7rem 0.65rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }

    .crust-card-btn:hover {
      background: #161616;
      border-color: rgba(220, 38, 38, 0.4);
    }

    .crust-card-btn.active {
      background: rgba(220, 38, 38, 0.12);
      border-color: #dc2626;
    }

    .crust-card-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: #ffffff;
    }

    .crust-card-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .highlight-gold {
      color: #ffc439 !important;
      font-weight: 700;
    }

    /* Toppings Chips */
    .toppings-pills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .topping-chip-btn {
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.45rem 0.8rem;
      border-radius: 9999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .topping-chip-btn:hover {
      border-color: rgba(220, 38, 38, 0.4);
      color: #ffffff;
    }

    .topping-chip-btn.active {
      background: rgba(220, 38, 38, 0.18);
      border-color: #dc2626;
      color: #ffffff;
    }

    .chip-toggle-icon {
      font-weight: 800;
      color: #dc2626;
    }

    .topping-chip-btn.active .chip-toggle-icon {
      color: #ffffff;
    }

    /* Botón de Avance de Paso */
    .step-footer-cta {
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-step-advance {
      width: 100%;
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.95rem 1.25rem;
      border-radius: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.95rem;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(220, 38, 38, 0.4);
      transition: all 0.2s;
    }

    .btn-step-advance:hover:not(:disabled) {
      background: #ef4444;
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(220, 38, 38, 0.55);
    }

    .btn-step-advance:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-cta-price {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 800;
    }

    /* ================================================================= */
    /* PASO 2: TABS DE PAGO & ACCIONES                                   */
    /* ================================================================= */
    .payment-tabs-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.65rem;
    }

    .pay-selector-card {
      background: #111111;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.85rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      position: relative;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pay-selector-card:hover {
      background: #161616;
      border-color: rgba(220, 38, 38, 0.4);
      transform: translateY(-2px);
    }

    .pay-selector-card.active {
      background: rgba(220, 38, 38, 0.12);
      border-color: #dc2626;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.25);
    }

    .pay-selector-header {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .pay-emoji {
      font-size: 1.1rem;
    }

    .pay-name {
      color: #ffffff;
      font-size: 0.88rem;
      font-weight: 700;
    }

    .pay-tag-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .pay-highlight-badge {
      position: absolute;
      top: 0.45rem;
      right: 0.45rem;
      background: #dc2626;
      color: #ffffff;
      font-size: 0.58rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
    }

    /* Tarjeta PayPal Flow (Smart Buttons limpios y elegantes) */
    .paypal-flow-card {
      background: linear-gradient(135deg, rgba(0, 48, 135, 0.12) 0%, rgba(0, 121, 193, 0.06) 100%);
      border: 1px solid rgba(0, 121, 193, 0.4);
      border-radius: 18px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .paypal-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .paypal-lock-info {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: #93c5fd;
    }

    .lock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    .buyer-protection-pill {
      font-size: 0.7rem;
      color: #bfdbfe;
      background: rgba(0, 48, 135, 0.35);
      border: 1px solid rgba(0, 121, 193, 0.35);
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
    }

    .paypal-status-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(0, 121, 193, 0.3);
      padding: 0.45rem 0.75rem;
      border-radius: 10px;
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .status-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      display: inline-block;
    }

    .btn-toggle-client-id {
      background: transparent;
      border: none;
      color: #38bdf8;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }

    .btn-toggle-client-id:hover {
      color: #ffffff;
    }

    .paypal-config-box {
      background: #080808;
      border: 1px solid rgba(0, 121, 193, 0.35);
      border-radius: 12px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .pp-config-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #cbd5e1;
    }

    .pp-config-input-row {
      display: flex;
      gap: 0.4rem;
    }

    .pp-config-input {
      flex: 1;
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #ffffff;
      padding: 0.4rem 0.6rem;
      font-size: 0.78rem;
      font-family: monospace;
    }

    .btn-save-pp-id {
      background: #0070ba;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.4rem 0.85rem;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-save-pp-id:hover {
      background: #005ea6;
    }

    .pp-config-help {
      font-size: 0.68rem;
      color: #64748b;
      margin: 0;
    }

    .paypal-warning-box {
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      border-radius: 10px;
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: #fca5a5;
    }

    .paypal-real-buttons-wrapper {
      min-height: 50px;
      width: 100%;
      margin: 0.35rem 0;
    }

    #paypal-smart-button-container {
      width: 100%;
      min-height: 48px;
    }

    .paypal-loading-skeleton {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      padding: 1.1rem;
      background: rgba(0, 48, 135, 0.15);
      border: 1px dashed rgba(0, 121, 193, 0.4);
      border-radius: 14px;
      color: #93c5fd;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .paypal-express-fallback-row {
      display: flex;
      justify-content: center;
      margin-top: 0.15rem;
    }

    .btn-paypal-express-fallback {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.72rem;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.2s;
    }

    .btn-paypal-express-fallback:hover {
      color: #38bdf8;
    }

    .paypal-buttons-minimal-stack {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .btn-paypal-yellow-clean {
      width: 100%;
      padding: 0.95rem 1rem;
      border-radius: 28px;
      background: #ffc439;
      color: #003087;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      font-size: 0.98rem;
      font-weight: 800;
      box-shadow: 0 4px 18px rgba(255, 196, 57, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-paypal-yellow-clean:hover:not(:disabled) {
      background: #f2ba36;
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(255, 196, 57, 0.6);
    }

    .btn-paypal-blue-clean {
      width: 100%;
      padding: 0.85rem 1rem;
      border-radius: 28px;
      background: #003087;
      color: #ffffff;
      border: none;
      cursor: pointer;
      font-size: 0.84rem;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0, 48, 135, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-paypal-blue-clean:hover:not(:disabled) {
      background: #002366;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 48, 135, 0.5);
    }

    .btn-paypal-yellow-clean:disabled, .btn-paypal-blue-clean:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .pp-font-logo {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-style: italic;
      font-weight: 900;
      font-size: 1.18rem;
      letter-spacing: -0.5px;
    }

    .pp-blue-dark { color: #003087; }
    .pp-blue-light { color: #0079C1; }

    .pp-btn-amount {
      font-size: 0.9rem;
      font-weight: 700;
    }

    .paypal-clean-caption {
      font-size: 0.72rem;
      color: #94a3b8;
      text-align: center;
      margin: 0;
    }

    /* Standard Flow Card (Tarjeta / Efectivo) */
    .standard-flow-card {
      margin-top: 0.5rem;
    }

    .btn-confirm-standard {
      width: 100%;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      background: #dc2626;
      color: #ffffff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.95rem;
      font-weight: 700;
      box-shadow: 0 4px 18px rgba(220, 38, 38, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-confirm-standard:hover:not(:disabled) {
      background: #ef4444;
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(220, 38, 38, 0.6);
    }

    .btn-confirm-standard:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-total-pill {
      background: rgba(0, 0, 0, 0.35);
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.92rem;
      font-weight: 800;
    }

    .spinner-clean {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Botón Volver */
    .step-back-row {
      margin-top: 0.5rem;
      text-align: center;
    }

    .btn-step-back-link {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.78rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .btn-step-back-link:hover {
      color: #ffffff;
      text-decoration: underline;
    }

    /* ================================================================= */
    /* MODAL CHECKOUT PAYPAL OFICIAL (ALTA FIDELIDAD)                    */
    /* ================================================================= */
    .paypal-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }

    .paypal-modal-window {
      background: #ffffff;
      color: #0f172a;
      border-radius: 22px;
      max-width: 440px;
      width: 100%;
      padding: 1.75rem;
      position: relative;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95);
      border: 1px solid rgba(0, 48, 135, 0.2);
    }

    .btn-paypal-close {
      position: absolute;
      top: 1.15rem;
      right: 1.15rem;
      background: #f1f5f9;
      border: none;
      color: #64748b;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .btn-paypal-close:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .pp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.85rem;
      margin-bottom: 1.15rem;
    }

    .pp-logo-wrap {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .pp-logo-p1 {
      font-size: 1.5rem;
      font-weight: 900;
      font-style: italic;
      color: #003087;
    }

    .pp-logo-p2 {
      font-size: 1.5rem;
      font-weight: 900;
      font-style: italic;
      color: #0079C1;
      margin-left: -4px;
    }

    .pp-brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      font-style: italic;
      color: #003087;
      letter-spacing: -0.5px;
    }

    .pp-secure-badge {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #16a34a;
      background: #f0fdf4;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      border: 1px solid #bbf7d0;
    }

    .pp-order-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.95rem;
      margin-bottom: 1.15rem;
    }

    .pp-merchant-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      margin-bottom: 0.65rem;
      padding-bottom: 0.45rem;
      border-bottom: 1px dashed #cbd5e1;
    }

    .pp-merchant-label { color: #64748b; }
    .pp-merchant-name { color: #0f172a; font-weight: 700; }

    .pp-item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .pp-item-title {
      display: block;
      font-size: 0.9rem;
      color: #0f172a;
    }

    .pp-item-meta {
      font-size: 0.74rem;
      color: #64748b;
    }

    .pp-item-amount {
      font-size: 0.95rem;
      color: #0f172a;
      white-space: nowrap;
    }

    .pp-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.65rem 0;
    }

    .pp-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.86rem;
      font-weight: 700;
      color: #0f172a;
    }

    .pp-total-highlight {
      font-size: 1.25rem;
      color: #003087;
      font-weight: 800;
    }

    .pp-funding-sources {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .pp-funding-title {
      font-size: 0.76rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pp-funding-option {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.65rem 0.85rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pp-funding-option:hover {
      border-color: #0079C1;
      background: #f0f9ff;
    }

    .pp-funding-option.selected {
      border-color: #003087;
      background: #eff6ff;
    }

    .pp-funding-option input[type="radio"] {
      accent-color: #003087;
    }

    .pp-option-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .pp-option-title {
      font-size: 0.86rem;
      font-weight: 600;
      color: #0f172a;
    }

    .pp-option-sub {
      font-size: 0.7rem;
      color: #64748b;
    }

    .pp-check-mark {
      color: #003087;
      font-weight: 900;
    }

    .pp-buyer-box {
      margin-bottom: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .pp-buyer-label {
      font-size: 0.74rem;
      font-weight: 600;
      color: #475569;
    }

    .pp-buyer-input {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
      font-size: 0.86rem;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s;
    }

    .pp-buyer-input:focus {
      border-color: #003087;
      box-shadow: 0 0 0 2px rgba(0, 48, 135, 0.15);
    }

    .pp-actions-footer {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .btn-pp-complete-payment {
      width: 100%;
      padding: 0.9rem;
      border-radius: 28px;
      background: #ffc439;
      color: #003087;
      font-size: 0.96rem;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(255, 196, 57, 0.4);
      transition: all 0.2s;
    }

    .btn-pp-complete-payment:hover:not(:disabled) {
      background: #f2ba36;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 196, 57, 0.6);
    }

    .btn-pp-cancel {
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.78rem;
      cursor: pointer;
      padding: 0.3rem;
      text-align: center;
    }

    .btn-pp-cancel:hover {
      color: #0f172a;
      text-decoration: underline;
    }

    .pp-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(0, 48, 135, 0.25);
      border-top-color: #003087;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .pp-legal-footer {
      margin-top: 0.85rem;
      text-align: center;
      font-size: 0.66rem;
      color: #94a3b8;
      line-height: 1.4;
    }

    /* Animaciones Generales */
    .animate-pop-in {
      animation: popIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-float-slow {
      animation: floatSlow 4s ease-in-out infinite;
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .animate-pulse-slow {
      animation: pulseSlow 2s ease-in-out infinite;
    }

    @keyframes pulseSlow {
      0%, 100% { opacity: 0.85; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.03); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 880px) {
      .modal-order-grid {
        grid-template-columns: 1fr;
        height: auto;
        max-height: 92vh;
        overflow-y: auto;
      }
      .order-visual-panel {
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 1.5rem;
      }
      .order-form-panel {
        padding: 1.5rem;
      }
      .size-cards-row, .crust-cards-row, .payment-tabs-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PedidoFormComponent {
  readonly pizzaPreset = input<SaborPizza | null>(null);
  readonly cerrar = output<void>();
  readonly pedidoExitoso = output<Pedido>();

  readonly pedidoService = inject(PedidoService);
  readonly paypalService = inject(PaypalService);
  readonly authService = inject(AuthService);

  readonly pasoActual = signal<1 | 2>(1);

  saborSeleccionado = 'Pepperoni Clásica Byte';
  saborPersonalizadoTexto = '';
  correoCliente = '';
  readonly tamanoSeleccionado = signal<'mediana' | 'familiar' | 'jumbo'>('familiar');
  readonly masaSeleccionada = signal<'tradicional' | 'borde_queso' | 'fina'>('tradicional');
  readonly extraQueso = signal<boolean>(false);
  readonly extraChampinones = signal<boolean>(false);
  readonly extraJalapenos = signal<boolean>(false);
  readonly extraTocino = signal<boolean>(false);
  readonly extraTrufa = signal<boolean>(false);
  readonly metodoPagoSeleccionado = signal<'PAYPAL' | 'TARJETA' | 'EFECTIVO'>('PAYPAL');
  readonly modalPaypalAbierto = signal<boolean>(false);
  fuenteFondosPaypal: 'saldo' | 'tarjeta' = 'saldo';
  paypalEmailComprador = '';
  readonly procesandoPagoPaypal = signal<boolean>(false);

  // Estados específicos de PayPal Smart Buttons
  readonly renderizandoBotonesPaypal = signal<boolean>(false);
  readonly mostrarConfigPaypal = signal<boolean>(false);
  paypalClientIdInput = '';

  readonly tamanos = [
    { id: 'mediana' as const, nombre: 'Mediana (12")', detalle: '6 rebanadas • 1-2 pers (-$2.00)' },
    { id: 'familiar' as const, nombre: 'Familiar (16")', detalle: '8 rebanadas • 3-4 pers (Estándar)' },
    { id: 'jumbo' as const, nombre: 'Jumbo (18")', detalle: '12 rebanadas • 5+ pers (+$4.00)' },
  ];

  constructor() {
    this.paypalClientIdInput = this.paypalService.paypalClientId();

    // Auto-completar email si el usuario ya inició sesión
    const usuarioLogueado = this.authService.usuarioActual();
    if (usuarioLogueado?.email) {
      this.correoCliente = usuarioLogueado.email;
    }

    effect(() => {
      const preset = this.pizzaPreset();
      if (preset) {
        this.saborSeleccionado = preset.nombre;
      }
    });

    // Reaccionar al cambio a Paso 2 con PayPal seleccionado
    effect(() => {
      const paso = this.pasoActual();
      const metodo = this.metodoPagoSeleccionado();
      if (paso === 2 && metodo === 'PAYPAL') {
        setTimeout(() => {
          this.montarBotonesPaypal();
        }, 120);
      }
    });
  }

  pizzaActual(): SaborPizza | undefined {
    return this.pedidoService.catalogoPizzas.find(p => p.nombre === this.saborSeleccionado) 
      || this.pedidoService.catalogoPizzas[0];
  }

  esSaborPersonalizado(): boolean {
    return this.saborSeleccionado === 'OTRO';
  }

  obtenerNombreSaborFinal(): string {
    if (this.esSaborPersonalizado()) {
      return this.saborPersonalizadoTexto.trim();
    }
    return this.saborSeleccionado;
  }

  obtenerNombreTamano(): string {
    const t = this.tamanos.find(x => x.id === this.tamanoSeleccionado());
    return t ? t.nombre : 'Familiar (16")';
  }

  obtenerEscalaPizza(): string {
    switch (this.tamanoSeleccionado()) {
      case 'mediana': return 'scale(0.84)';
      case 'jumbo': return 'scale(1.14)';
      default: return 'scale(1.0)';
    }
  }

  obtenerBadgeTamano(): string {
    switch (this.tamanoSeleccionado()) {
      case 'mediana': return 'Ø 30 cm • 1-2 pers';
      case 'jumbo': return 'Ø 45 cm • 5+ pers';
      default: return 'Ø 40 cm • 3-4 pers';
    }
  }

  obtenerNombreMasa(): string {
    switch (this.masaSeleccionada()) {
      case 'borde_queso': return 'Borde Relleno (+ $2.50)';
      case 'fina': return 'Crocante al Carbón';
      default: return 'Napolitana Tradicional';
    }
  }

  obtenerExtrasTexto(): string {
    const extras: string[] = [];
    if (this.extraQueso()) extras.push('Fior di Latte');
    if (this.extraChampinones()) extras.push('Champiñones');
    if (this.extraJalapenos()) extras.push('Jalapeños');
    if (this.extraTocino()) extras.push('Tocino');
    if (this.extraTrufa()) extras.push('Trufa');
    return extras.join(', ');
  }

  seleccionarTamano(tamId: 'mediana' | 'familiar' | 'jumbo'): void {
    this.tamanoSeleccionado.set(tamId);
  }

  calcularPrecio(): number {
    const pizza = this.pedidoService.catalogoPizzas.find(p => p.nombre === this.saborSeleccionado);
    let base = pizza ? pizza.precio : 12.99;
    if (this.tamanoSeleccionado() === 'mediana') base -= 2.00;
    if (this.tamanoSeleccionado() === 'jumbo') base += 4.00;
    if (this.masaSeleccionada() === 'borde_queso') base += 2.50;
    if (this.extraQueso()) base += 1.50;
    if (this.extraChampinones()) base += 1.00;
    if (this.extraJalapenos()) base += 0.80;
    if (this.extraTocino()) base += 1.20;
    if (this.extraTrufa()) base += 1.75;
    return Math.max(base, 8.99);
  }

  onSaborChange(val: string): void {
    this.saborSeleccionado = val;
  }

  irAPaso2(): void {
    if (!this.obtenerNombreSaborFinal()) return;
    this.pasoActual.set(2);
    if (this.metodoPagoSeleccionado() === 'PAYPAL') {
      setTimeout(() => this.montarBotonesPaypal(), 150);
    }
  }

  onCorreoClienteChange(): void {
    if (this.metodoPagoSeleccionado() === 'PAYPAL' && this.correoCliente && this.correoCliente.includes('@')) {
      setTimeout(() => this.montarBotonesPaypal(), 200);
    }
  }

  seleccionarMetodoPago(metodo: 'PAYPAL' | 'TARJETA' | 'EFECTIVO'): void {
    this.metodoPagoSeleccionado.set(metodo);
    if (metodo === 'PAYPAL') {
      setTimeout(() => this.montarBotonesPaypal(), 100);
    }
  }

  guardarNuevoPaypalId(): void {
    if (!this.paypalClientIdInput) return;
    this.paypalService.guardarClientId(this.paypalClientIdInput);
    this.mostrarConfigPaypal.set(false);
    setTimeout(() => this.montarBotonesPaypal(), 200);
  }

  async montarBotonesPaypal(): Promise<void> {
    if (this.metodoPagoSeleccionado() !== 'PAYPAL' || this.pasoActual() !== 2) return;
    if (!this.correoCliente) return;

    this.renderizandoBotonesPaypal.set(true);
    await new Promise(r => setTimeout(r, 140));

    await this.paypalService.renderizarBotonesPayPal('paypal-smart-button-container', {
      saborPizza: this.obtenerNombreSaborFinal(),
      precioTotal: this.calcularPrecio(),
      correoCliente: this.correoCliente,
      onAprobado: async (detalles) => {
        console.log('✅ [PayPal Smart Buttons] Pago oficial completado:', detalles);
        if (!this.correoCliente && detalles.payerEmail) {
          this.correoCliente = detalles.payerEmail;
        }
        await this.enviarPedidoConMetodo('PAYPAL', detalles.transactionId);
      },
      onError: (err) => {
        console.error('❌ [PayPal Smart Buttons] Error en checkout:', err);
      },
      onCancel: (data) => {
        console.log('ℹ️ [PayPal Smart Buttons] Orden cancelada por el usuario:', data);
      }
    });

    this.renderizandoBotonesPaypal.set(false);
  }

  abrirModalPaypal(): void {
    const saborFinal = this.obtenerNombreSaborFinal();
    if (!saborFinal) return;
    this.paypalEmailComprador = this.correoCliente || 'cliente.pizzabyte@paypal.com';
    this.modalPaypalAbierto.set(true);
  }

  cerrarModalPaypal(): void {
    this.modalPaypalAbierto.set(false);
  }

  async completarPagoPaypal(): Promise<void> {
    this.procesandoPagoPaypal.set(true);
    const transactionId = 'PAYID-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Notificar al backend sobre la verificación de la transacción
    try {
      await this.paypalService.verificarConBackend({
        transactionId,
        payerEmail: this.paypalEmailComprador || this.correoCliente,
        payerName: 'Comprador PizzaByte Express',
        amount: this.calcularPrecio(),
        currency: 'USD'
      });
    } catch (e) {
      // Backend opcional
    }

    await this.enviarPedidoConMetodo('PAYPAL', transactionId);
    this.procesandoPagoPaypal.set(false);
    this.modalPaypalAbierto.set(false);
  }

  async enviarPedido(): Promise<void> {
    await this.enviarPedidoConMetodo(this.metodoPagoSeleccionado());
  }

  async enviarPedidoConMetodo(metodo: 'PAYPAL' | 'TARJETA' | 'EFECTIVO', idTransaccionPaypal?: string): Promise<void> {
    const saborFinal = this.obtenerNombreSaborFinal();
    if (!saborFinal || !this.correoCliente) return;

    const extras = this.obtenerExtrasTexto();
    let saborCompleto = saborFinal;
    if (this.masaSeleccionada() === 'borde_queso') saborCompleto += ' (Borde Relleno)';
    if (extras) saborCompleto += ` + ${extras}`;

    const nuevoPedido = await this.pedidoService.ordenarPizza(
      saborCompleto,
      this.correoCliente,
      this.calcularPrecio(),
      metodo,
      idTransaccionPaypal,
      {
        tamano: this.obtenerNombreTamano()
      }
    );

    this.pedidoService.iniciarSeguimientoEnVivo();
    this.pedidoExitoso.emit(nuevoPedido);
    this.cerrar.emit();
  }
}
