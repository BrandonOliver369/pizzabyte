import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { CredencialesLogin, DatosRegistro } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="account-page-wrapper animate-fade-in">
      
      <!-- CASO 1: USUARIO CON SESIÓN INICIADA (DASHBOARD PERSONALIZADO CON MIS PEDIDOS) -->
      @if (authService.usuarioActual(); as user) {
        <div class="user-dashboard-container animate-slide-up">
          
          <!-- Banner de Perfil de Usuario (Black, Red & White) -->
          <div class="user-profile-header glass-card">
            <div class="profile-main-info">
              <div class="avatar-ring">
                @if (user.avatarUrl) {
                  <img [src]="user.avatarUrl" [alt]="user.nombre" class="avatar-img-circle" />
                } @else {
                  <span class="avatar-emoji">{{ user.rol === 'ADMINISTRADOR' ? '👨‍💼' : '🍕' }}</span>
                }
              </div>
              
              <div class="user-identity">
                <div class="identity-badges">
                  <span class="role-badge" [class.badge-admin]="user.rol === 'ADMINISTRADOR'">
                    {{ user.rol === 'ADMINISTRADOR' ? '👑 ' + user.rol : '⭐ CLIENTE VIP PIZZABYTE' }}
                  </span>
                  @if (user.proveedorAuth === 'GOOGLE') {
                    <span class="provider-badge google">
                      <svg viewBox="0 0 24 24" width="13" height="13"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                      <span>Google OAuth</span>
                    </span>
                  } @else if (user.proveedorAuth === 'FACEBOOK') {
                    <span class="provider-badge facebook">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span>Facebook Login</span>
                    </span>
                  }
                  <span class="session-live-badge">
                    <span class="online-indicator-dot"></span>
                    <span>Sesión Segura Activa</span>
                  </span>
                </div>
                
                <h2 class="welcome-heading">¡Hola de nuevo, {{ user.nombre }}!</h2>
                <div class="meta-row">
                  <span class="meta-item">
                    <span class="meta-icon">👤</span> &#64;{{ user.username }}
                  </span>
                  <span class="meta-divider">•</span>
                  <span class="meta-item">
                    <span class="meta-icon">✉️</span> {{ user.email }}
                  </span>
                  @if (authService.expiracionSesion()) {
                    <span class="meta-divider">•</span>
                    <span class="meta-item cookie-tag" title="Cookie con vigencia prolongada Max-Age=604800s">
                      🍪 Sesión válida hasta: {{ authService.expiracionSesion() }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Botón de Cerrar Sesión & Acceso Admin -->
            <div class="profile-actions">
              @if (user.rol === 'ADMINISTRADOR') {
                <button 
                  type="button" 
                  class="btn-admin-panel-cta btn-shimmer"
                  (click)="irAlAdmin.emit()"
                  title="Abrir el Sistema KDS de Cocina y Despacho">
                  <span>👑 Panel Admin & KDS</span>
                  <span class="btn-arrow">→</span>
                </button>
              }
              <button 
                type="button" 
                class="btn-logout"
                (click)="cerrarSesion()"
                [disabled]="authService.procesando()">
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          <!-- SECCIÓN DEPENDIENDO DEL ROL -->
          @if (user.rol === 'ADMINISTRADOR') {
            <!-- TARJETA EXCLUSIVA DE ADMINISTRADOR / OPERADOR EN MI CUENTA -->
            <div class="admin-account-card glass-card animate-slide-up">
              <div class="admin-account-icon-wrap">
                <span class="admin-shield-icon-lg">🛡️</span>
              </div>
              <div class="admin-account-body">
                <div class="admin-card-badges">
                  <span class="pill-kds-internal">SISTEMA INTERNO KDS</span>
                  <span class="pill-role-master">SUPER ADMINISTRADOR</span>
                  <span class="pill-kds-live">🔴 HORNO 400°C EN VIVO</span>
                </div>
                <h3 class="admin-card-headline">Consola de Operaciones KDS & Cocina</h3>
                <p class="admin-card-paragraph">
                  Has iniciado sesión con la cuenta maestra de <strong>Administrador Central</strong>. Como operador del sistema, los pedidos de los clientes se gestionan en tiempo real dentro del <strong>Kitchen Display System (KDS)</strong>, controlando el horno a 400°C, despacho express y auditoría.
                </p>
                <div class="admin-kds-stats-strip">
                  <div class="kds-stat-item">
                    <span class="kds-stat-number">{{ pedidoService.pedidos().length }}</span>
                    <span class="kds-stat-label">Pedidos en Sistema</span>
                  </div>
                  <div class="kds-stat-divider"></div>
                  <div class="kds-stat-item">
                    <span class="kds-stat-number">{{ pedidosEnCocinaCount() }}</span>
                    <span class="kds-stat-label">En Horno / Cocina</span>
                  </div>
                  <div class="kds-stat-divider"></div>
                  <div class="kds-stat-item">
                    <span class="kds-stat-number">{{ pedidosEnRepartoCount() }}</span>
                    <span class="kds-stat-label">En Reparto Express</span>
                  </div>
                </div>
                <div class="admin-card-cta-group">
                  <button 
                    type="button" 
                    class="btn-open-kds-terminal btn-shimmer"
                    (click)="irAlAdmin.emit()">
                    <span>👑 Abrir Consola KDS & Cocina</span>
                    <span class="btn-arrow">→</span>
                  </button>
                  <button 
                    type="button" 
                    class="btn-account-logout-alt"
                    (click)="cerrarSesion()">
                    <span>🚪 Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <!-- SECCIÓN: MIS PEDIDOS REALIZADOS (CLIENTES VIP) -->
            <div class="user-orders-section glass-card">
              <div class="orders-section-header">
                <div>
                  <span class="section-eyebrow">SEGUIMIENTO DE ÓRDENES</span>
                  <h3 class="orders-title">Mis Pedidos Realizados</h3>
                  <p class="orders-sub">
                    Consulta tus pizzas ordenadas, tiempo estimado y comprobantes de entrega en tiempo real.
                  </p>
                </div>

                <div class="orders-header-right">
                  <div class="orders-stats-pill">
                    <span class="stats-count">{{ pedidosUsuario().length }}</span>
                    <span class="stats-label">{{ pedidosUsuario().length === 1 ? 'Pedido' : 'Pedidos' }}</span>
                  </div>
                  @if (pedidosUsuario().length > 0) {
                    <button class="btn-clear-history" (click)="pedidoService.limpiarHistorial()" title="Limpiar historial de pedidos">
                      🗑️ Limpiar
                    </button>
                  }
                  <button class="btn-new-order-account" (click)="irAlMenu.emit()" title="Ordenar otra pizza de autor">
                    ➕ Nueva Pizza
                  </button>
                </div>
              </div>

              @if (pedidosUsuario().length > 0) {
                <div class="orders-list-grid">
                  @for (pedido of pedidosUsuario(); track pedido.id) {
                    <article class="user-order-card hover-lift">
                      <div class="order-card-top">
                        <div class="order-number-badge">
                          <span class="order-hash">#</span>
                          <strong>{{ pedido.id }}</strong>
                        </div>

                        <span class="order-status-badge" [ngClass]="(pedido.estado || 'CONFIRMADO').toLowerCase()">
                          @switch (pedido.estado || 'CONFIRMADO') {
                            @case ('CONFIRMADO') { <span>✨ Confirmado</span> }
                            @case ('EN_CAMINO') { <span>🛵 En Reparto</span> }
                            @case ('ENTREGADO') { <span>✓ Entregado</span> }
                            @default { <span>{{ pedido.estado }}</span> }
                          }
                        </span>
                      </div>

                      <div class="order-card-body">
                        <div class="order-pizza-item">
                          <span class="pizza-icon">🍕</span>
                          <div class="pizza-details">
                            <h4 class="pizza-name">{{ pedido.saborPizza }}</h4>
                            <span class="pizza-time">🕒 {{ pedido.fechaCreacion }}</span>
                          </div>
                        </div>

                        <div class="order-client-mail">
                          <span class="mail-icon">📧</span>
                          <span class="mail-address">{{ pedido.correoCliente }}</span>
                        </div>
                      </div>

                      <div class="order-card-footer">
                        <div class="order-price-box">
                          <span class="price-label">Total pagado:</span>
                          <span class="price-value">\${{ (pedido.precioTotal || 13.99) | number:'1.2-2' }}</span>
                        </div>

                        <div class="order-footer-actions">
                          <button 
                            type="button"
                            class="btn-view-mail-card" 
                            (click)="verCorreoAsociado(pedido)"
                            title="Ver confirmación SMTP / Comprobante Brevo">
                            ✉️ Ver Mail SMTP
                          </button>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <!-- Estado Vacío cuando no hay pedidos -->
                <div class="empty-orders-state">
                  <div class="empty-icon-box">🍕</div>
                  <h4>Aún no tienes pedidos registrados</h4>
                  <p>Nuestras pizzas artesanales con masa madre de 48 horas y horno a la leña están listas para hornearse.</p>
                  <button type="button" class="btn-go-menu btn-shimmer" (click)="irAlMenu.emit()">
                    <span>Explorar Menú d'Autore</span>
                    <span class="btn-arrow">→</span>
                  </button>
                </div>
              }
            </div>
          }

        </div>
      }

      <!-- CASO 2: USUARIO NO LOGUEADO (LOGIN / REGISTRO BLACK, RED & WHITE) -->
      @else {
        <div class="auth-center-container">
          
          <div class="auth-card-apple glass-card animate-pop-in">
            <!-- Header de Autenticación -->
            <div class="auth-header">
              <div class="brand-crest">
                <span class="crest-emoji">🔐</span>
              </div>
              <h2 class="auth-title">Mi Cuenta en PizzaByte</h2>
              <p class="auth-subtitle">
                Inicia sesión para consultar <strong>Mis Pedidos</strong>, historial de compras y beneficios exclusivos.
              </p>

              <!-- Conmutador Elegante de Pestañas (Segmented Toggle) -->
              <div class="segmented-control">
                <button 
                  type="button"
                  class="segment-btn" 
                  [class.active]="modoAuth() === 'login'"
                  (click)="cambiarModo('login')">
                  <span>Iniciar Sesión</span>
                </button>
                <button 
                  type="button"
                  class="segment-btn" 
                  [class.active]="modoAuth() === 'registro'"
                  (click)="cambiarModo('registro')">
                  <span>Registrarse</span>
                </button>
                <div class="segment-slider" [class.slide-right]="modoAuth() === 'registro'"></div>
              </div>
            </div>

            <!-- Feedback de Alertas -->
            @if (authService.mensajeError(); as err) {
              <div class="auth-alert error animate-shake">
                <span class="alert-icon">⚠️</span>
                <span>{{ err }}</span>
              </div>
            }

            @if (mensajeExito(); as exito) {
              <div class="auth-alert success animate-fade-in">
                <span class="alert-icon">✓</span>
                <span>{{ exito }}</span>
              </div>
            }

            <!-- FORMULARIO 1: INICIAR SESIÓN -->
            @if (modoAuth() === 'login') {
              <div class="auth-form-box animate-fade-in">

                <!-- BOTONES DE INICIO RÁPIDO: GOOGLE & FACEBOOK -->
                <div class="social-login-section">
                  <span class="social-login-eyebrow">ACCESO RÁPIDO CON 1 CLIC</span>
                  <div class="social-buttons-row">
                    <!-- Botón Oficial Google -->
                    <button 
                      type="button" 
                      class="btn-social-oauth btn-google-official"
                      (click)="abrirModalGoogle()"
                      [disabled]="authService.procesando()"
                      title="Iniciar sesión con tu cuenta de Google">
                      <svg class="social-svg-logo" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span class="btn-text">Continuar con Google</span>
                    </button>

                    <!-- Botón Oficial Facebook -->
                    <button 
                      type="button" 
                      class="btn-social-oauth btn-facebook-official"
                      (click)="abrirModalFacebook()"
                      [disabled]="authService.procesando()"
                      title="Iniciar sesión con tu cuenta de Facebook">
                      <svg class="social-svg-logo" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span class="btn-text">Continuar con Facebook</span>
                    </button>
                  </div>

                  <div class="social-divider-separator">
                    <span class="divider-line"></span>
                    <span class="divider-text">o con tu cuenta PizzaByte</span>
                    <span class="divider-line"></span>
                  </div>
                </div>

                <form (ngSubmit)="ejecutarLogin()" #loginForm="ngForm">
                  <div class="input-group">
                    <label for="login-username">Usuario o Correo</label>
                  <div class="input-field-wrap">
                    <span class="field-icon">👤</span>
                    <input 
                      id="login-username"
                      type="text" 
                      name="username"
                      [(ngModel)]="credenciales.username"
                      placeholder="tu_usuario o correo"
                      required
                      class="apple-input"
                      autocomplete="username" />
                  </div>
                </div>

                <div class="input-group">
                  <div class="label-row">
                    <label for="login-password">Contraseña</label>
                  </div>
                  <div class="input-field-wrap">
                    <span class="field-icon">🔒</span>
                    <input 
                      id="login-password"
                      type="password" 
                      name="password"
                      [(ngModel)]="credenciales.password"
                      placeholder="••••••••"
                      required
                      class="apple-input"
                      autocomplete="current-password" />
                  </div>
                </div>

                <div class="remember-row">
                  <label class="checkbox-container">
                    <input 
                      type="checkbox" 
                      name="recordar" 
                      [(ngModel)]="credenciales.recordar" />
                    <span class="checkmark"></span>
                    <span class="label-text">Mantener sesión activa por 7 días (Cookie)</span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  class="btn-submit-apple btn-shimmer"
                  [disabled]="loginForm.invalid || authService.procesando()">
                  @if (authService.procesando()) {
                    <span class="spinner"></span>
                    <span>Verificando Credenciales...</span>
                  } @else {
                    <span>Iniciar Sesión & Ver Pedidos</span>
                    <span class="arrow-right">→</span>
                  }
                </button>

                <!-- Acceso Rápido para Pruebas de Cliente -->
                <div class="quick-presets-box">
                  <span class="presets-label">Acceso de prueba para clientes:</span>
                  <div class="presets-buttons">
                    <button type="button" class="preset-chip" (click)="cargarPreset('brandon', 'byte2026')">
                      🍕 Cliente Demo: Brandon (byte2026)
                    </button>
                  </div>
                </div>

                <div class="form-switch-prompt">
                  <span>¿Aún no eres miembro de PizzaByte?</span>
                  <button type="button" class="link-switch" (click)="cambiarModo('registro')">
                    Regístrate aquí
                  </button>
                </div>
              </form>
              </div>
            }

            <!-- FORMULARIO 2: REGISTRO DE NUEVO CLIENTE -->
            @if (modoAuth() === 'registro') {
              <div class="auth-form-box animate-fade-in">
                <!-- BOTONES DE REGISTRO RÁPIDO: GOOGLE & FACEBOOK -->
                <div class="social-login-section">
                  <span class="social-login-eyebrow">REGISTRO RÁPIDO CON 1 CLIC</span>
                  <div class="social-buttons-row">
                    <!-- Botón Oficial Google -->
                    <button 
                      type="button" 
                      class="btn-social-oauth btn-google-official"
                      (click)="abrirModalGoogle()"
                      [disabled]="authService.procesando()"
                      title="Registrarse con tu cuenta de Google">
                      <svg class="social-svg-logo" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span class="btn-text">Registrarse con Google</span>
                    </button>

                    <!-- Botón Oficial Facebook -->
                    <button 
                      type="button" 
                      class="btn-social-oauth btn-facebook-official"
                      (click)="abrirModalFacebook()"
                      [disabled]="authService.procesando()"
                      title="Registrarse con tu cuenta de Facebook">
                      <svg class="social-svg-logo" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span class="btn-text">Registrarse con Facebook</span>
                    </button>
                  </div>

                  <div class="social-divider-separator">
                    <span class="divider-line"></span>
                    <span class="divider-text">o con tu correo y contraseña</span>
                    <span class="divider-line"></span>
                  </div>
                </div>

                <form (ngSubmit)="ejecutarRegistro()" #registroForm="ngForm">
                  <div class="input-group">
                    <label for="reg-nombre">Nombre Completo</label>
                    <div class="input-field-wrap">
                      <span class="field-icon">✨</span>
                      <input 
                        id="reg-nombre"
                        type="text" 
                        name="nombre"
                        [(ngModel)]="datosRegistro.nombre"
                        placeholder="Ej. Brandon Oliver"
                        required
                        class="apple-input" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="reg-email">Correo Electrónico</label>
                    <div class="input-field-wrap">
                      <span class="field-icon">✉️</span>
                      <input 
                        id="reg-email"
                        type="email" 
                        name="email"
                        [(ngModel)]="datosRegistro.email"
                        placeholder="tucorreo@ejemplo.com"
                        required
                        email
                        class="apple-input" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="reg-user">Nombre de Usuario</label>
                    <div class="input-field-wrap">
                      <span class="field-icon">👤</span>
                      <input 
                        id="reg-user"
                        type="text" 
                        name="username"
                        [(ngModel)]="datosRegistro.username"
                        placeholder="usuario_pizzabyte"
                        required
                        class="apple-input" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="reg-password">Contraseña</label>
                    <div class="input-field-wrap">
                      <span class="field-icon">🔒</span>
                      <input 
                        id="reg-password"
                        type="password" 
                        name="password"
                        [(ngModel)]="datosRegistro.password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minlength="6"
                        class="apple-input" />
                    </div>
                  </div>

                  <div class="input-group">
                    <label for="reg-confirmar">Confirmar Contraseña</label>
                    <div class="input-field-wrap">
                      <span class="field-icon">🔒</span>
                      <input 
                        id="reg-confirmar"
                        type="password" 
                        name="confirmarPassword"
                        [(ngModel)]="confirmarPassword"
                        placeholder="Repite tu contraseña"
                        required
                        class="apple-input" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn-submit-apple btn-shimmer"
                    [disabled]="registroForm.invalid || authService.procesando()">
                    @if (authService.procesando()) {
                      <span class="spinner"></span>
                      <span>Creando Cuenta...</span>
                    } @else {
                      <span>Crear Cuenta & Autenticar</span>
                      <span class="arrow-right">→</span>
                    }
                  </button>

                  <div class="form-switch-prompt">
                    <span>¿Ya tienes una cuenta registrada?</span>
                    <button type="button" class="link-switch" (click)="cambiarModo('login')">
                      Inicia sesión aquí
                    </button>
                  </div>
                </form>
              </div>
            }

          </div>

        </div>
      }

      <!-- MODAL ELECCIÓN DE CUENTA GOOGLE OAUTH -->
      @if (modalGoogleAbierto()) {
        <div class="oauth-modal-overlay animate-fade-in" (click)="cerrarModalGoogle()">
          <div class="oauth-modal-card animate-pop-in" (click)="$event.stopPropagation()">
            <button type="button" class="btn-close-oauth" (click)="cerrarModalGoogle()" title="Cerrar ventana">✕</button>
            
            <div class="oauth-modal-header">
              <svg class="google-header-logo" viewBox="0 0 24 24" width="36" height="36">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <h3 class="oauth-title">Iniciar sesión con Google</h3>
              <p class="oauth-sub">Autenticación oficial con <strong>Google Identity Services</strong></p>
            </div>

            <!-- SECCIÓN 1: LOGIN REAL CON GOOGLE IDENTITY SERVICES (GIS SDK) -->
            <div class="google-gis-real-section">
              @if (!authService.googleClientId() || editandoClientId()) {
                <div class="gis-setup-box">
                  <div class="gis-setup-header">
                    <span class="gis-badge">🔑 GOOGLE CLIENT ID OAUTH 2.0</span>
                    <span class="gis-subtitle">Configura tu Client ID para iniciar con tu cuenta Google real:</span>
                  </div>

                  <div class="gis-input-group">
                    <input 
                      type="text" 
                      class="apple-input-sm full-width"
                      placeholder="Ej: 1234567890-xyz.apps.googleusercontent.com"
                      [(ngModel)]="tempGoogleClientId" />
                    <button 
                      type="button" 
                      class="btn-activate-client-id"
                      [disabled]="!tempGoogleClientId.trim()"
                      (click)="guardarYActivarGoogleClientId()">
                      <span>✓ Guardar y Activar</span>
                    </button>
                  </div>

                  <!-- Botón Desplegable: Guía Rápida de 3 Minutos -->
                  <div class="gis-guide-toggle-row">
                    <button 
                      type="button" 
                      class="btn-guide-toggle" 
                      (click)="toggleGuiaGoogle()">
                      <span>{{ mostrarGuiaGoogle() ? '▲ Ocultar pasos' : '❓ ¿Qué necesito y cómo obtener mi Client ID en 3 minutos?' }}</span>
                    </button>
                  </div>

                  @if (mostrarGuiaGoogle()) {
                    <div class="gis-guide-content animate-fade-in">
                      <ol class="guide-steps-list">
                        <li>
                          <strong>Google Cloud:</strong> Ve a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">console.cloud.google.com/apis/credentials</a> (gratis).
                        </li>
                        <li>
                          <strong>Pantalla de consentimiento:</strong> Elige tipo <strong>Externa</strong>, pon nombre "PizzaByte" y tu correo.
                        </li>
                        <li>
                          <strong>Crear credenciales:</strong> Clic en <em>+ Crear credenciales</em> → <em>ID de cliente de OAuth</em> → Tipo: <strong>Aplicación Web</strong>.
                        </li>
                        <li>
                          <strong>Orígenes de JavaScript autorizados:</strong> Agrega exactamente:
                          <div class="origin-chips">
                            <code>http://localhost:4200</code>
                            <code>http://localhost:8080</code>
                            <code>http://localhost</code>
                          </div>
                        </li>
                        <li>
                          <strong>Listo:</strong> Copia el <em>ID de cliente</em> generado (.apps.googleusercontent.com) y pégalo arriba.
                        </li>
                      </ol>
                    </div>
                  }
                </div>
              } @else {
                <!-- Client ID Configurado: Botón Oficial de Google -->
                <div class="gis-active-box">
                  <div class="gis-active-status">
                    <div class="status-left">
                      <span class="active-dot"></span>
                      <span class="active-text">Google OAuth 2.0 Conectado</span>
                    </div>
                    <button type="button" class="btn-edit-client-id" (click)="editandoClientId.set(true)" title="Cambiar Client ID">
                      ✏️ Modificar ID
                    </button>
                  </div>

                  <!-- Contenedor Oficial de Renderizado de Google Identity Services -->
                  <div class="google-official-btn-container">
                    <div id="googleRealButtonWrapper" class="google-official-btn-slot"></div>
                  </div>

                  <button 
                    type="button" 
                    class="btn-launch-prompt" 
                    (click)="lanzarPromptGoogle()">
                    <span>🚀 Abrir Selector Oficial de Cuentas Google</span>
                  </button>
                </div>
              }
            </div>

            <div class="social-divider-separator oauth-divider">
              <span class="divider-line"></span>
              <span class="divider-text">o con perfiles de prueba de desarrollo</span>
              <span class="divider-line"></span>
            </div>

            <div class="oauth-accounts-list">
              <!-- Cuenta Demo 1 -->
              <button 
                type="button" 
                class="account-select-card"
                (click)="loginGoogleCuenta('Brandon Oliver', 'brandooliver777@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80')">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Brandon Oliver" class="account-avatar" />
                <div class="account-details">
                  <strong class="account-name">Brandon Oliver (Demo)</strong>
                  <span class="account-email">brandooliver777&#64;gmail.com</span>
                </div>
                <span class="account-badge">VIP</span>
              </button>

              <!-- Cuenta Demo 2 -->
              <button 
                type="button" 
                class="account-select-card"
                (click)="loginGoogleCuenta('Katniss Everdeen', 'katniss2305@gmail.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80')">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Katniss Everdeen" class="account-avatar" />
                <div class="account-details">
                  <strong class="account-name">Katniss Everdeen (Demo)</strong>
                  <span class="account-email">katniss2305&#64;gmail.com</span>
                </div>
                <span class="account-badge">Gourmet</span>
              </button>
            </div>

            <div class="oauth-modal-footer">
              <span class="oauth-security-note">🔒 Google Identity Services SDK Oficial • Cifrado JWT SHA-256 • Cookie 7 Días</span>
            </div>
          </div>
        </div>
      }

      <!-- MODAL ELECCIÓN DE CUENTA FACEBOOK LOGIN -->
      @if (modalFacebookAbierto()) {
        <div class="oauth-modal-overlay animate-fade-in" (click)="cerrarModalFacebook()">
          <div class="oauth-modal-card facebook-theme animate-pop-in" (click)="$event.stopPropagation()">
            <button type="button" class="btn-close-oauth" (click)="cerrarModalFacebook()" title="Cerrar ventana">✕</button>
            
            <div class="oauth-modal-header">
              <div class="facebook-logo-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h3 class="oauth-title">Iniciar sesión con Facebook</h3>
              <p class="oauth-sub">Continúa en <strong>PizzaByte</strong> con tu perfil de Facebook</p>
            </div>

            <!-- SECCIÓN 1: LOGIN REAL CON FACEBOOK JAVASCRIPT SDK -->
            <div class="facebook-gis-real-section">
              @if (!authService.facebookAppId() || editandoFacebookAppId()) {
                <div class="gis-setup-box fb">
                  <div class="gis-setup-header">
                    <span class="gis-badge fb">🔑 FACEBOOK APP ID (META DEVELOPERS)</span>
                    <span class="gis-subtitle">Configura tu App ID de Meta para iniciar con tu cuenta real de Facebook:</span>
                  </div>

                  <div class="gis-input-group">
                    <input 
                      type="text" 
                      class="apple-input-sm full-width fb"
                      placeholder="Ej: 1234567890123456"
                      [(ngModel)]="tempFacebookAppId" />
                    <button 
                      type="button" 
                      class="btn-activate-fb-id"
                      [disabled]="!tempFacebookAppId.trim()"
                      (click)="guardarYActivarFacebookAppId()">
                      <span>✓ Guardar y Activar Facebook Real</span>
                    </button>
                  </div>

                  <!-- Botón Desplegable: Guía Rápida de 3 Minutos -->
                  <div class="gis-guide-toggle-row">
                    <button 
                      type="button" 
                      class="btn-guide-toggle fb" 
                      (click)="toggleGuiaFacebook()">
                      <span>{{ mostrarGuiaFacebook() ? '▲ Ocultar pasos' : '❓ ¿Qué necesito y cómo obtener mi Facebook App ID en 3 minutos?' }}</span>
                    </button>
                  </div>

                  @if (mostrarGuiaFacebook()) {
                    <div class="gis-guide-content fb animate-fade-in">
                      <ol class="guide-steps-list">
                        <li>
                          <strong>Meta for Developers:</strong> Entra a <a href="https://developers.facebook.com" target="_blank" rel="noopener">developers.facebook.com</a> con tu cuenta de Facebook.
                        </li>
                        <li>
                          <strong>Crear App:</strong> Ve a <em>Mis apps</em> → <em>Crear app</em> → Selecciona <strong>Autenticar y solicitar datos a usuarios con Inicio de sesión con Facebook</strong> (o <em>Consumidor</em>) → Nombre: <strong>PizzaByte</strong>.
                        </li>
                        <li>
                          <strong>Agregar producto:</strong> Selecciona <strong>Inicio de sesión con Facebook</strong> → Tipo: <strong>Web</strong>.
                        </li>
                        <li>
                          <strong>URL del sitio web:</strong> Ingresa <code>http://localhost:4200/</code> y guarda.
                        </li>
                        <li>
                          <strong>URIs de redireccionamiento OAuth válidos:</strong> En la configuración de Facebook Login, agrega:
                          <div class="origin-chips fb">
                            <code>http://localhost:4200/</code>
                            <code>http://localhost:4200</code>
                            <code>http://localhost:8080</code>
                          </div>
                        </li>
                        <li>
                          <strong>Listo:</strong> Copia el <strong>Identificador de la app (App ID)</strong> de la barra superior y pégalo arriba.
                        </li>
                      </ol>
                    </div>
                  }
                </div>
              } @else {
                <!-- App ID Configurado: Botón Oficial de Facebook -->
                <div class="gis-active-box fb">
                  <div class="gis-active-status">
                    <div class="status-left">
                      <span class="active-dot fb"></span>
                      <span class="active-text fb">Facebook SDK v19.0 Conectado</span>
                    </div>
                    <button type="button" class="btn-edit-client-id" (click)="editandoFacebookAppId.set(true)" title="Cambiar App ID">
                      ✏️ Modificar ID
                    </button>
                  </div>

                  <button 
                    type="button" 
                    class="btn-fb-real-launch" 
                    [disabled]="authService.procesando()"
                    (click)="iniciarFacebookOAuthReal()">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Iniciar sesión con Cuenta Real de Facebook</span>
                  </button>
                </div>
              }
            </div>

            <div class="social-divider-separator oauth-divider">
              <span class="divider-line"></span>
              <span class="divider-text">o con perfiles de prueba de desarrollo</span>
              <span class="divider-line"></span>
            </div>

            <div class="oauth-accounts-list">
              <!-- Cuenta Demo 1 -->
              <button 
                type="button" 
                class="account-select-card fb-card"
                (click)="loginFacebookCuenta('Brandon Oliver', 'brandon.oliver.fb@facebook.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80')">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Brandon Oliver" class="account-avatar" />
                <div class="account-details">
                  <strong class="account-name">Brandon Oliver (Demo)</strong>
                  <span class="account-email">brandon.oliver.fb&#64;facebook.com</span>
                </div>
                <span class="account-badge fb">VIP</span>
              </button>

              <!-- Cuenta Demo 2 -->
              <button 
                type="button" 
                class="account-select-card fb-card"
                (click)="loginFacebookCuenta('Sofia Reyes', 'sofia.reyes@facebook.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80')">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" alt="Sofia Reyes" class="account-avatar" />
                <div class="account-details">
                  <strong class="account-name">Sofia Reyes (Demo)</strong>
                  <span class="account-email">sofia.reyes&#64;facebook.com</span>
                </div>
                <span class="account-badge fb">Gourmet</span>
              </button>
            </div>

            <div class="oauth-modal-footer">
              <span class="oauth-security-note">🔒 Facebook Login SDK v19.0 Oficial • Acceso Cifrado • Cookie 7 Días</span>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .account-page-wrapper {
      max-width: 1080px;
      margin: 0 auto;
      padding: 2rem 1.5rem 5rem;
    }

    /* Tarjetas Glassmórficas */
    .glass-card {
      background: rgba(12, 12, 12, 0.9);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    /* ================================================================= */
    /* ESTADO CONECTADO (DASHBOARD) - BLACK, RED & WHITE                 */
    /* ================================================================= */
    .user-dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .user-profile-header {
      padding: 2.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      border: 1px solid rgba(220, 38, 38, 0.35);
      background: linear-gradient(135deg, rgba(16, 16, 16, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
    }

    .profile-main-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar-ring {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: radial-gradient(circle, #200a0a 0%, #0a0a0a 100%);
      border: 2px solid #dc2626;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(220, 38, 38, 0.35);
    }

    .avatar-emoji {
      font-size: 2.6rem;
    }

    .identity-badges {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.35rem;
      flex-wrap: wrap;
    }

    .role-badge {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 1px;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      background: rgba(220, 38, 38, 0.15);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.45);
    }

    .role-badge.badge-admin {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
    }

    .session-live-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      color: #ffffff;
      font-weight: 600;
      background: rgba(220, 38, 38, 0.12);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .online-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #dc2626;
      box-shadow: 0 0 8px #dc2626;
      animation: pulseDot 2s infinite ease-in-out;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .welcome-heading {
      font-family: 'Playfair Display', serif;
      font-size: 1.85rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 0.4rem;
      font-size: 0.82rem;
      color: #94a3b8;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .meta-divider {
      color: #475569;
    }

    .cookie-tag {
      color: #ff334b;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-admin-panel-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%);
      color: #ffffff;
      padding: 0.65rem 1.35rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.25);
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(220, 38, 38, 0.45);
      transition: all 0.2s ease;
    }

    .btn-admin-panel-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(220, 38, 38, 0.7);
    }

    .btn-logout:hover {
      background: #dc2626;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
    }

    /* Tarjeta Exclusiva de Administrador en Mi Cuenta */
    .admin-account-card {
      padding: 2.5rem 2.25rem;
      border: 1px solid rgba(220, 38, 38, 0.45);
      background: radial-gradient(circle at 10% 20%, rgba(220, 38, 38, 0.12) 0%, rgba(14, 14, 18, 0.95) 70%);
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
    }

    .admin-account-icon-wrap {
      flex-shrink: 0;
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, rgba(20, 20, 25, 0.9) 100%);
      border: 2px solid rgba(239, 68, 68, 0.6);
      box-shadow: 0 0 25px rgba(220, 38, 38, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-shield-icon-lg {
      font-size: 2.2rem;
    }

    .admin-account-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .admin-card-badges {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .pill-kds-internal {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #ef4444;
      letter-spacing: 0.08em;
    }

    .pill-role-master {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.2rem 0.65rem;
      border-radius: 100px;
      background: #dc2626;
      color: #ffffff;
      letter-spacing: 0.05em;
    }

    .pill-kds-live {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 100px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .admin-card-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .admin-card-paragraph {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin: 0;
      max-width: 820px;
    }

    .admin-kds-stats-strip {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1rem 1.5rem;
      margin: 0.5rem 0;
      flex-wrap: wrap;
    }

    .kds-stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .kds-stat-number {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ef4444;
      font-family: 'Playfair Display', serif;
      line-height: 1;
    }

    .kds-stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .kds-stat-divider {
      width: 1px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
    }

    .admin-card-cta-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn-open-kds-terminal {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: #ffffff;
      padding: 0.85rem 1.65rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.92rem;
      letter-spacing: 0.04em;
      border: 1px solid rgba(255, 255, 255, 0.25);
      cursor: pointer;
      box-shadow: 0 6px 22px rgba(220, 38, 38, 0.55);
      transition: all 0.2s ease;
    }

    .btn-open-kds-terminal:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(220, 38, 38, 0.75);
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    }

    .btn-account-logout-alt {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 0.85rem 1.4rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-account-logout-alt:hover {
      background: rgba(220, 38, 38, 0.15);
      border-color: rgba(220, 38, 38, 0.4);
      color: #ffffff;
    }

    /* Sección de Pedidos */
    .user-orders-section {
      padding: 2.25rem;
    }

    .orders-section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .section-eyebrow {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #ff334b;
      display: block;
      margin-bottom: 4px;
    }

    .orders-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      color: #ffffff;
      margin: 0;
    }

    .orders-sub {
      font-size: 0.84rem;
      color: #94a3b8;
      margin: 0.3rem 0 0;
    }

    .orders-header-right {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .orders-stats-pill {
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      border-radius: 14px;
      padding: 0.45rem 1rem;
      text-align: center;
    }

    .stats-count {
      font-size: 1.4rem;
      font-weight: 800;
      color: #dc2626;
      display: block;
      line-height: 1;
    }

    .stats-label {
      font-size: 0.62rem;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-clear-history {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      padding: 0.5rem 0.85rem;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-clear-history:hover {
      background: rgba(220, 38, 38, 0.2);
      border-color: #dc2626;
      color: #ffffff;
    }

    .btn-new-order-account {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      padding: 0.5rem 0.95rem;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(220, 38, 38, 0.35);
    }

    .btn-new-order-account:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5);
    }

    /* Grilla de Pedidos del Usuario */
    .orders-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 1.25rem;
    }

    .user-order-card {
      background: #0d0d0d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.25s ease;
    }

    .user-order-card:hover {
      border-color: rgba(220, 38, 38, 0.5);
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.8), 0 0 20px rgba(220, 38, 38, 0.15);
    }

    .order-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-number-badge {
      display: flex;
      align-items: baseline;
      gap: 2px;
      font-family: 'JetBrains Mono', monospace;
      color: #ffffff;
      font-size: 0.95rem;
    }

    .order-hash {
      color: #dc2626;
      font-weight: 700;
    }

    .order-status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      background: rgba(220, 38, 38, 0.15);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.4);
    }

    .order-status-badge.confirmado {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
    }

    .order-status-badge.en_camino {
      background: rgba(220, 38, 38, 0.2);
      color: #ff334b;
      border-color: rgba(220, 38, 38, 0.5);
    }

    .order-status-badge.entregado {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.25);
    }

    .order-pizza-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .pizza-icon {
      font-size: 1.8rem;
    }

    .pizza-name {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }

    .pizza-time {
      font-size: 0.72rem;
      color: #94a3b8;
      display: block;
      margin-top: 3px;
    }

    .order-client-mail {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.75rem;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.35rem 0.6rem;
      border-radius: 8px;
    }

    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.85rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.08);
    }

    .price-label {
      font-size: 0.7rem;
      color: #94a3b8;
      display: block;
    }

    .price-value {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
    }

    .btn-view-mail-card {
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-view-mail-card:hover {
      background: #dc2626;
      color: #ffffff;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
    }

    /* Estado Vacío */
    .empty-orders-state {
      text-align: center;
      padding: 3.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon-box {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      animation: floatSubtle 4s ease-in-out infinite;
    }

    @keyframes floatSubtle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .empty-orders-state h4 {
      font-size: 1.25rem;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }

    .empty-orders-state p {
      color: #94a3b8;
      max-width: 420px;
      font-size: 0.88rem;
      margin: 0 0 1.5rem;
    }

    .btn-go-menu {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-go-menu:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.45);
    }

    /* ================================================================= */
    /* ESTADO DESCONECTADO: LOGIN & REGISTRO (BLACK, RED & WHITE)        */
    /* ================================================================= */
    .auth-center-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 1rem 0;
    }

    .auth-card-apple {
      width: 100%;
      max-width: 460px;
      padding: 2.75rem 2.25rem;
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: rgba(10, 10, 10, 0.95);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-crest {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, rgba(10, 10, 10, 0.95) 100%);
      border: 1px solid rgba(220, 38, 38, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 0 30px rgba(220, 38, 38, 0.3);
    }

    .crest-emoji {
      font-size: 1.8rem;
    }

    .auth-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }

    .auth-subtitle {
      font-size: 0.84rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 auto 1.5rem;
    }

    .auth-subtitle strong {
      color: #ffffff;
    }

    /* Segmented Control */
    .segmented-control {
      position: relative;
      background: #080808;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 4px;
      display: flex;
      align-items: center;
    }

    .segment-btn {
      flex: 1;
      position: relative;
      z-index: 2;
      background: transparent;
      border: none;
      padding: 0.65rem 0;
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      transition: color 0.25s ease;
    }

    .segment-btn.active {
      color: #ffffff;
    }

    .segment-slider {
      position: absolute;
      top: 4px;
      left: 4px;
      width: calc(50% - 4px);
      height: calc(100% - 8px);
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      border-radius: 10px;
      z-index: 1;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.45);
    }

    .segment-slider.slide-right {
      transform: translateX(100%);
    }

    /* Alertas */
    .auth-alert {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.82rem;
      margin-bottom: 1.25rem;
    }

    .auth-alert.error {
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: #ffffff;
    }

    .auth-alert.success {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    /* Formularios */
    .auth-form-box {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      text-align: left;
    }

    .input-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .input-field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 14px;
      font-size: 1rem;
      color: #64748b;
      pointer-events: none;
    }

    .apple-input {
      width: 100%;
      background: #080808;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.75rem 1rem 0.75rem 2.6rem;
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s ease;
    }

    .apple-input:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.25);
      background: #0f0f0f;
    }

    .remember-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin: 0.2rem 0;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.76rem;
      color: #94a3b8;
      cursor: pointer;
    }

    .checkbox-container input {
      accent-color: #dc2626;
      width: 15px;
      height: 15px;
      cursor: pointer;
    }

    /* Botón Submit Apple */
    .btn-submit-apple {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.85rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.92rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 0.4rem;
    }

    .btn-submit-apple:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.55);
    }

    .btn-submit-apple:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Presets Rápidos */
    .quick-presets-box {
      margin-top: 0.8rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      text-align: center;
    }

    .presets-label {
      font-size: 0.68rem;
      color: #94a3b8;
      display: block;
      margin-bottom: 0.45rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .presets-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .preset-chip {
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.72rem;
      padding: 0.3rem 0.6rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .preset-chip:hover {
      background: #dc2626;
      color: #ffffff;
      transform: scale(1.02);
    }

    .form-switch-prompt {
      text-align: center;
      font-size: 0.78rem;
      color: #94a3b8;
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      align-items: center;
    }

    .link-switch {
      background: none;
      border: none;
      color: #ff334b;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
      font-size: 0.78rem;
    }

    .link-switch:hover {
      color: #ffffff;
    }

    /* Animaciones & Shimmer */
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .animate-pop-in {
      animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .animate-slide-up {
      animation: slideUp 0.35s ease-out forwards;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .user-profile-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .profile-actions {
        width: 100%;
      }
      .btn-logout {
        width: 100%;
        justify-content: center;
      }
      .orders-list-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ================================================================= */
    /* SOCIAL LOGINS (GOOGLE & FACEBOOK) - BLACK, RED & WHITE ACCENTS    */
    /* ================================================================= */
    .avatar-img-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .provider-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
    }

    .provider-badge.google {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    .provider-badge.facebook {
      background: rgba(24, 119, 242, 0.2);
      color: #70b4ff;
      border: 1px solid rgba(24, 119, 242, 0.5);
    }

    .social-login-section {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .social-login-eyebrow {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #dc2626;
      text-transform: uppercase;
      text-align: center;
    }

    .social-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    @media (max-width: 540px) {
      .social-buttons-row {
        grid-template-columns: 1fr;
      }
    }

    .btn-social-oauth {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      padding: 0.8rem 1rem;
      border-radius: 14px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
    }

    .btn-google-official {
      background: #ffffff;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-google-official:hover:not(:disabled) {
      background: #f8fafc;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 255, 255, 0.15);
      border-color: #ffffff;
    }

    .btn-facebook-official {
      background: #1877F2;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(24, 119, 242, 0.35);
    }

    .btn-facebook-official:hover:not(:disabled) {
      background: #166fe5;
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(24, 119, 242, 0.55);
    }

    .btn-social-oauth:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-social-oauth:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .social-divider-separator {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin: 0.4rem 0;
    }

    .social-divider-separator .divider-line {
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.12);
    }

    .social-divider-separator .divider-text {
      font-size: 0.72rem;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* OAUTH MODAL DIALOGS */
    .oauth-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
    }

    .oauth-modal-card {
      background: #0f0f0f;
      border: 1px solid rgba(220, 38, 38, 0.4);
      border-radius: 24px;
      max-width: 440px;
      width: 100%;
      padding: 2rem;
      position: relative;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(220, 38, 38, 0.2);
    }

    .oauth-modal-card.facebook-theme {
      border-color: rgba(24, 119, 242, 0.45);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(24, 119, 242, 0.25);
    }

    .btn-close-oauth {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
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

    .btn-close-oauth:hover {
      background: #dc2626;
      border-color: #dc2626;
      transform: rotate(90deg);
    }

    .oauth-modal-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .facebook-logo-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #1877F2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
      box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
    }

    .oauth-title {
      color: #ffffff;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0.6rem 0 0.3rem;
    }

    .oauth-sub {
      color: #a1a1aa;
      font-size: 0.84rem;
      margin: 0;
    }

    .oauth-accounts-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .account-select-card {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      width: 100%;
    }

    .account-select-card:hover {
      background: rgba(220, 38, 38, 0.12);
      border-color: rgba(220, 38, 38, 0.5);
      transform: translateX(4px);
    }

    .account-select-card.fb-card:hover {
      background: rgba(24, 119, 242, 0.15);
      border-color: rgba(24, 119, 242, 0.6);
    }

    .account-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #dc2626;
    }

    .account-select-card.fb-card .account-avatar {
      border-color: #1877F2;
    }

    .account-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .account-name {
      color: #ffffff;
      font-size: 0.92rem;
      font-weight: 600;
    }

    .account-email {
      color: #a1a1aa;
      font-size: 0.76rem;
    }

    .account-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: #ffffff;
      background: #dc2626;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }

    .account-badge.fb {
      background: #1877F2;
    }

    .custom-oauth-form {
      margin-top: 0.6rem;
      padding-top: 0.9rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .custom-oauth-label {
      font-size: 0.76rem;
      font-weight: 600;
      color: #a1a1aa;
    }

    .custom-oauth-inputs {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .apple-input-sm {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0.65rem 0.85rem;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .apple-input-sm:focus {
      border-color: #dc2626;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
    }

    .btn-submit-oauth {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      color: #ffffff;
    }

    .btn-submit-oauth.google {
      background: #dc2626;
    }

    .btn-submit-oauth.google:hover:not(:disabled) {
      background: #ef4444;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
    }

    .btn-submit-oauth.facebook {
      background: #1877F2;
    }

    .btn-submit-oauth.facebook:hover:not(:disabled) {
      background: #166fe5;
      box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
    }

    .btn-submit-oauth:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* GOOGLE GIS REAL SECTION */
    .google-gis-real-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(220, 38, 38, 0.35);
      border-radius: 18px;
      padding: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .gis-setup-box {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .gis-setup-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .gis-badge {
      font-size: 0.64rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #dc2626;
      text-transform: uppercase;
    }

    .gis-subtitle {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .gis-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .apple-input-sm.full-width {
      width: 100%;
      box-sizing: border-box;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.76rem;
    }

    .btn-activate-client-id {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-activate-client-id:hover:not(:disabled) {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.5);
    }

    .btn-activate-client-id:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .gis-guide-toggle-row {
      display: flex;
      justify-content: flex-start;
      margin-top: 0.2rem;
    }

    .btn-guide-toggle {
      background: none;
      border: none;
      color: #ef4444;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      text-align: left;
    }

    .btn-guide-toggle:hover {
      color: #ffffff;
    }

    .gis-guide-content {
      background: #080808;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      margin-top: 0.35rem;
    }

    .guide-steps-list {
      margin: 0;
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      font-size: 0.76rem;
      color: #cbd5e1;
      line-height: 1.4;
    }

    .guide-steps-list a {
      color: #3b82f6;
      text-decoration: underline;
    }

    .origin-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.3rem;
    }

    .origin-chips code {
      background: rgba(220, 38, 38, 0.15);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.4);
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
    }

    .gis-active-box {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .gis-active-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .status-left {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .active-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    .active-text {
      font-size: 0.76rem;
      color: #22c55e;
      font-weight: 700;
    }

    .btn-edit-client-id {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      border-radius: 6px;
      padding: 0.2rem 0.5rem;
      font-size: 0.7rem;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-edit-client-id:hover {
      background: rgba(220, 38, 38, 0.2);
      border-color: #dc2626;
      color: #ffffff;
    }

    .google-official-btn-container {
      display: flex;
      justify-content: center;
      min-height: 44px;
      padding: 0.25rem 0;
    }

    .google-official-btn-slot {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .btn-launch-prompt {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.5);
      border-radius: 12px;
      padding: 0.65rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
      transition: all 0.2s ease;
    }

    .btn-launch-prompt:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
    }

    .oauth-divider {
      margin: 0.85rem 0;
    }

    /* FACEBOOK GIS REAL SECTION */
    .facebook-gis-real-section {
      background: rgba(24, 119, 242, 0.05);
      border: 1px solid rgba(24, 119, 242, 0.35);
      border-radius: 18px;
      padding: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .gis-badge.fb {
      color: #1877F2;
    }

    .apple-input-sm.fb:focus {
      border-color: #1877F2;
      box-shadow: 0 0 10px rgba(24, 119, 242, 0.3);
    }

    .btn-activate-fb-id {
      background: linear-gradient(135deg, #1877F2 0%, #0d5bbd 100%);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-activate-fb-id:hover:not(:disabled) {
      background: linear-gradient(135deg, #2b87ff 0%, #1877F2 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(24, 119, 242, 0.5);
    }

    .btn-guide-toggle.fb {
      color: #70b4ff;
    }

    .gis-guide-content.fb {
      border-color: rgba(24, 119, 242, 0.3);
    }

    .origin-chips.fb code {
      background: rgba(24, 119, 242, 0.15);
      border-color: rgba(24, 119, 242, 0.4);
      color: #e0f2fe;
    }

    .active-dot.fb {
      background: #1877F2;
      box-shadow: 0 0 8px #1877F2;
    }

    .active-text.fb {
      color: #70b4ff;
    }

    .btn-fb-real-launch {
      background: #1877F2;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      box-shadow: 0 4px 16px rgba(24, 119, 242, 0.4);
      transition: all 0.2s ease;
      width: 100%;
    }

    .btn-fb-real-launch:hover:not(:disabled) {
      background: #166fe5;
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(24, 119, 242, 0.6);
    }

    .btn-fb-real-launch:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .oauth-modal-footer {
      margin-top: 1.25rem;
      text-align: center;
    }

    .oauth-security-note {
      font-size: 0.7rem;
      color: #71717a;
    }

    @media (max-width: 768px) {
      .account-page-wrapper {
        padding: 1.5rem 1rem 4rem;
      }
      .user-profile-header {
        padding: 1.5rem 1.25rem;
        flex-direction: column;
        align-items: flex-start;
      }
      .profile-actions {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
      .admin-account-card {
        flex-direction: column;
        padding: 1.5rem;
        gap: 1.25rem;
      }
      .admin-kds-stats-strip {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        width: 100%;
      }
      .kds-stat-divider {
        display: none;
      }
      .auth-card-apple {
        padding: 1.75rem 1.25rem;
        border-radius: 18px;
      }
      .social-buttons-row {
        flex-direction: column;
      }
      .oauth-modal-card {
        width: 94%;
        max-width: 440px;
        padding: 1.5rem 1.25rem;
      }
    }
  `]
})
export class LoginComponent {
  readonly irAlMenu = output<void>();
  readonly irAlAdmin = output<void>();

  readonly authService = inject(AuthService);
  readonly pedidoService = inject(PedidoService);

  readonly modoAuth = signal<'login' | 'registro'>('login');
  readonly mensajeExito = signal<string | null>(null);

  credenciales: CredencialesLogin = {
    username: '',
    password: '',
    recordar: true
  };

  datosRegistro: DatosRegistro = {
    nombre: '',
    email: '',
    username: '',
    password: ''
  };

  confirmarPassword = '';

  readonly pedidosEnCocinaCount = computed(() =>
    this.pedidoService.pedidos().filter(p => p.estado === 'CONFIRMADO' || p.estado === 'EN_HORNO').length
  );

  readonly pedidosEnRepartoCount = computed(() =>
    this.pedidoService.pedidos().filter(p => p.estado === 'EN_CAMINO').length
  );

  /**
   * Filtra los pedidos del usuario autenticado (los administradores no tienen pedidos de consumo personal)
   */
  readonly pedidosUsuario = computed(() => {
    const user = this.authService.usuarioActual();
    const todos = this.pedidoService.pedidos();
    if (!user || user.rol === 'ADMINISTRADOR') return [];

    // Filtrar por el email del usuario o mostrar los pedidos del cliente
    const pedidosFiltrados = todos.filter(
      p => p.correoCliente?.toLowerCase() === user.email?.toLowerCase()
    );
    return pedidosFiltrados.length > 0 ? pedidosFiltrados : todos;
  });

  cambiarModo(modo: 'login' | 'registro'): void {
    this.modoAuth.set(modo);
    this.authService.mensajeError.set(null);
    this.mensajeExito.set(null);
  }

  cargarPreset(user: string, pass: string): void {
    this.credenciales.username = user;
    this.credenciales.password = pass;
    this.credenciales.recordar = true;
  }

  verCorreoAsociado(pedido: any): void {
    const notificacion = this.pedidoService.notificaciones().find(n => n.pedidoId === pedido.id);
    if (notificacion) {
      this.pedidoService.ultimaNotificacion.set(notificacion);
    } else {
      this.pedidoService.ultimaNotificacion.set({
        id: 'MAIL-HIST-' + pedido.id,
        pedidoId: pedido.id,
        destinatario: pedido.correoCliente,
        asunto: `¡Tu pedido #${pedido.id} está en camino! 🍕 - PizzaByte`,
        cuerpo: `Tu pizza de ${pedido.saborPizza} está en camino.`,
        saborPizza: pedido.saborPizza,
        timestamp: pedido.fechaCreacion || 'Recientemente',
        estadoEnvio: 'ENVIADO'
      });
    }
  }

  async ejecutarLogin(): Promise<void> {
    if (!this.credenciales.username || !this.credenciales.password) return;
    this.mensajeExito.set(null);
    const ok = await this.authService.login(this.credenciales);
    if (ok) {
      this.mensajeExito.set('¡Sesión iniciada con éxito! Bienvenido.');
    }
  }

  async ejecutarRegistro(): Promise<void> {
    if (this.datosRegistro.password !== this.confirmarPassword) {
      this.authService.mensajeError.set('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    this.mensajeExito.set(null);
    const ok = await this.authService.registrar(this.datosRegistro);
    if (ok) {
      this.mensajeExito.set(`¡Cuenta creada con éxito para ${this.datosRegistro.username}! Iniciando sesión...`);
      setTimeout(() => {
        this.modoAuth.set('login');
        this.credenciales.username = this.datosRegistro.username;
        this.credenciales.password = this.datosRegistro.password;
        this.ejecutarLogin();
      }, 1000);
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
    this.credenciales = { username: '', password: '', recordar: true };
    this.modoAuth.set('login');
  }

  readonly modalGoogleAbierto = signal<boolean>(false);
  readonly modalFacebookAbierto = signal<boolean>(false);
  readonly mostrarGuiaGoogle = signal<boolean>(false);
  readonly editandoClientId = signal<boolean>(false);
  tempGoogleClientId = '';
  googlePersonalizadoNombre = '';
  googlePersonalizadoEmail = '';
  facebookPersonalizadoNombre = '';
  facebookPersonalizadoEmail = '';

  abrirModalGoogle(): void {
    this.tempGoogleClientId = this.authService.googleClientId();
    this.editandoClientId.set(!this.authService.googleClientId());
    this.modalGoogleAbierto.set(true);
    this.authService.mensajeError.set(null);
    if (this.authService.googleClientId()) {
      this.inicializarBotonGoogleReal();
    }
  }

  cerrarModalGoogle(): void {
    this.modalGoogleAbierto.set(false);
  }

  toggleGuiaGoogle(): void {
    this.mostrarGuiaGoogle.update(v => !v);
  }

  guardarYActivarGoogleClientId(): void {
    const idLimpio = this.tempGoogleClientId.trim();
    if (!idLimpio) return;
    this.authService.guardarGoogleClientId(idLimpio);
    this.editandoClientId.set(false);
    this.inicializarBotonGoogleReal();
  }

  inicializarBotonGoogleReal(intento = 1): void {
    const clientId = this.authService.googleClientId();
    if (!clientId) return;

    if (typeof window === 'undefined') return;

    if (!(window as any).google?.accounts?.id) {
      if (intento < 15) {
        setTimeout(() => this.inicializarBotonGoogleReal(intento + 1), 200);
      }
      return;
    }

    setTimeout(() => {
      try {
        const gsi = (window as any).google.accounts.id;
        gsi.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response && response.credential) {
              const ok = await this.authService.procesarCredencialGoogleReal(response.credential);
              if (ok) {
                this.cerrarModalGoogle();
                const user = this.authService.usuarioActual();
                this.mensajeExito.set(`¡Bienvenido(a) con tu cuenta de Google real, ${user?.nombre || ''}!`);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const container = document.getElementById('googleRealButtonWrapper');
        if (container) {
          container.innerHTML = '';
          gsi.renderButton(container, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320
          });
        }

        // Lanzar selector One Tap
        gsi.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            console.log('Google One Tap en segundo plano:', notification.getNotDisplayedReason());
          }
        });
      } catch (err) {
        console.error('Error al inicializar Google Identity Services:', err);
      }
    }, 100);
  }

  lanzarPromptGoogle(): void {
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            console.log('Google prompt not displayed:', notification.getNotDisplayedReason());
          }
        });
      }
    } catch (err) {
      console.warn('Google prompt no pudo lanzarse:', err);
    }
  }

  readonly mostrarGuiaFacebook = signal<boolean>(false);
  readonly editandoFacebookAppId = signal<boolean>(false);
  tempFacebookAppId = '';

  abrirModalFacebook(): void {
    this.tempFacebookAppId = this.authService.facebookAppId();
    this.editandoFacebookAppId.set(!this.authService.facebookAppId());
    this.modalFacebookAbierto.set(true);
    this.authService.mensajeError.set(null);
    if (this.authService.facebookAppId()) {
      this.inicializarFacebookSDK();
    }
  }

  cerrarModalFacebook(): void {
    this.modalFacebookAbierto.set(false);
  }

  toggleGuiaFacebook(): void {
    this.mostrarGuiaFacebook.update(v => !v);
  }

  guardarYActivarFacebookAppId(): void {
    const idLimpio = this.tempFacebookAppId.trim();
    if (!idLimpio) return;
    this.authService.guardarFacebookAppId(idLimpio);
    this.editandoFacebookAppId.set(false);
    this.inicializarFacebookSDK();
  }

  inicializarFacebookSDK(intento = 1): void {
    const appId = this.authService.facebookAppId();
    if (!appId || typeof window === 'undefined') return;

    if (!(window as any).FB) {
      if (intento < 15) {
        setTimeout(() => this.inicializarFacebookSDK(intento + 1), 200);
      }
      return;
    }

    try {
      (window as any).FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
      console.log('✅ [Facebook SDK] Inicializado con App ID:', appId);
    } catch (err) {
      console.error('Error al inicializar Facebook SDK:', err);
    }
  }

  iniciarFacebookOAuthReal(): void {
    if (typeof window === 'undefined' || !(window as any).FB) {
      this.authService.mensajeError.set('El SDK de Facebook aún se está cargando. Intenta de nuevo en unos segundos.');
      return;
    }

    this.authService.procesando.set(true);
    try {
      (window as any).FB.login((response: any) => {
        if (response?.authResponse) {
          (window as any).FB.api('/me', { fields: 'name,email,picture.width(250).height(250)' }, async (profile: any) => {
            this.authService.procesando.set(false);
            if (!profile || profile.error) {
              this.authService.mensajeError.set('No se pudo obtener el perfil de Facebook.');
              return;
            }

            const ok = await this.authService.loginConFacebook({
              nombre: profile.name,
              email: profile.email || `${profile.id}@facebook.com`,
              avatarUrl: profile.picture?.data?.url
            });

            if (ok) {
              this.cerrarModalFacebook();
              const user = this.authService.usuarioActual();
              this.mensajeExito.set(`¡Bienvenido(a) con tu cuenta de Facebook real, ${user?.nombre || ''}!`);
            }
          });
        } else {
          this.authService.procesando.set(false);
          console.log('El usuario canceló el inicio de sesión con Facebook.');
        }
      }, { scope: 'public_profile,email' });
    } catch (err: any) {
      this.authService.procesando.set(false);
      this.authService.mensajeError.set(err?.message || 'Error al conectar con Facebook Login');
    }
  }

  async loginGoogleCuenta(nombre: string, email: string, avatarUrl: string): Promise<void> {
    this.modalGoogleAbierto.set(false);
    this.mensajeExito.set(null);
    const ok = await this.authService.loginConGoogle({ nombre, email, avatarUrl });
    if (ok) {
      this.mensajeExito.set(`¡Bienvenido vía Google OAuth, ${nombre}!`);
    }
  }

  async loginGooglePersonalizado(): Promise<void> {
    if (!this.googlePersonalizadoEmail) return;
    const nombre = this.googlePersonalizadoNombre.trim() || this.googlePersonalizadoEmail.split('@')[0];
    await this.loginGoogleCuenta(
      nombre, 
      this.googlePersonalizadoEmail.trim(), 
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    );
  }

  async loginFacebookCuenta(nombre: string, email: string, avatarUrl: string): Promise<void> {
    this.modalFacebookAbierto.set(false);
    this.mensajeExito.set(null);
    const ok = await this.authService.loginConFacebook({ nombre, email, avatarUrl });
    if (ok) {
      this.mensajeExito.set(`¡Bienvenido vía Facebook Login, ${nombre}!`);
    }
  }

  async loginFacebookPersonalizado(): Promise<void> {
    if (!this.facebookPersonalizadoEmail) return;
    const nombre = this.facebookPersonalizadoNombre.trim() || this.facebookPersonalizadoEmail.split('@')[0];
    await this.loginFacebookCuenta(
      nombre, 
      this.facebookPersonalizadoEmail.trim(), 
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
    );
  }
}
