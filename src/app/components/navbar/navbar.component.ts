import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  template: `
    <!-- Barra Superior de Anuncios y Estado de Cocina (Black, Red & White) -->
    <div class="top-announcement-bar">
      <div class="announcement-content">
        <div class="ann-item oven-status">
          <span class="pulse-beacon red"></span>
          <span class="ann-text"><strong class="red-text">FORNO A LEGNA:</strong> 400°C Temp. Óptima</span>
        </div>
        <div class="ann-item hide-tablet">
          <span class="ann-icon">🌾</span>
          <span class="ann-text"><strong>Masa Madre 48h:</strong> Fermentación Natural Biga</span>
        </div>
        <div class="ann-item hide-mobile">
          <span class="ann-icon">🛵</span>
          <span class="ann-text"><strong>Spedizione Gratuita:</strong> En órdenes desde $25</span>
        </div>
        <div class="ann-item hide-mobile">
          <span class="ann-icon">⏱️</span>
          <span class="ann-text"><strong>Entrega Express:</strong> 25-35 min</span>
        </div>
        <div class="ann-item concierge-item">
          <span class="ann-icon">📞</span>
          <span class="ann-text"><strong>Concierge:</strong> (555) 890-BYTE</span>
        </div>
      </div>
    </div>

    <!-- Header Principal con Glassmorphism Flotante Negro y Rojo -->
    <header class="navbar-header">
      <div class="navbar-container">
        <!-- Logo y Cresta de Marca PizzaByte -->
        <div class="brand" (click)="seleccionarTab('menu')" title="PizzaByte Haute Cuisine - Ir al Menú">
          <div class="logo-crest">
            <img src="logo-pizzabyte.png" alt="PizzaByte Logo" class="brand-logo-img" />
            <div class="crest-glow"></div>
          </div>
          <div class="brand-text">
            <div class="brand-title-group">
              <span class="brand-title">Pizza<span class="brand-accent">Byte</span></span>
              <span class="brand-sparkle">✦</span>
            </div>
            <span class="brand-subtitle">ATELIER ARTIGIANALE <span class="sub-bullet">•</span> ALTA COCINA</span>
          </div>
        </div>

        <!-- Navegación Central: Floating Glass Capsule (Desktop) -->
        <!-- Nota: 'Mis Pedidos' ahora está exclusivamente dentro de 'Mi Cuenta' -->
        <nav class="nav-pill-capsule hide-tablet">
          <button 
            class="nav-tab" 
            [class.active]="tabActiva() === 'menu'"
            (click)="seleccionarTab('menu')">
            <span class="tab-label">Menú & Carta</span>
          </button>

          <button 
            class="nav-tab" 
            [class.active]="tabActiva() === 'promociones'"
            (click)="seleccionarTab('promociones')">
            <span class="tab-label">Promociones</span>
            <span class="pill-badge-promo">2x1</span>
          </button>

          <button 
            class="nav-tab" 
            [class.active]="tabActiva() === 'delivery'"
            (click)="seleccionarTab('delivery')">
            <span class="tab-label">Delivery</span>
          </button>

          <button 
            class="nav-tab" 
            [class.active]="tabActiva() === 'login'"
            (click)="seleccionarTab('login')">
            <span class="tab-label">Mi Cuenta</span>
            @if (authService.sesionActiva()) {
              <span class="dot-online" title="Sesión activa y acceso a Mis Pedidos"></span>
            }
          </button>

          @if (authService.esAdmin()) {
            <button 
              class="nav-tab tab-admin-vip" 
              [class.active]="tabActiva() === 'admin'"
              (click)="seleccionarTab('admin')"
              title="Ir al Sistema KDS y Cocina de Administración">
              <span class="tab-label">👑 Admin Cocina</span>
              <span class="pill-badge-admin">KDS</span>
            </button>
          }
        </nav>

        <!-- Controles a la Derecha (Action Hub) -->
        <div class="right-controls">
          <!-- Botón Especial: Cómo Funciona DEV Capsule -->
          <button 
            class="btn-tech-capsule hide-laptop"
            [class.active]="tabActiva() === 'tech_docs'"
            (click)="seleccionarTab('tech_docs')"
            title="Arquitectura Hexagonal, Spring Boot API, Patrones & Hash/Bash">
            <span class="tech-icon-glow">⚡</span>
            <div class="tech-btn-text">
              <span class="tech-title">Cómo Funciona</span>
              <span class="tech-sub">Arquitectura</span>
            </div>
            <span class="dev-badge">DEV</span>
          </button>

          <!-- Toggle de Modo Brevo / Simulador -->
          <div class="brevo-capsule hide-mobile" [title]="pedidoService.modoSimulacion() ? 'Modo Simulación activo' : 'Conectado a Brevo REST API v3'">
            <div class="brevo-status" [class.is-sim]="pedidoService.modoSimulacion()" [class.is-real]="!pedidoService.modoSimulacion()">
              <span class="brevo-dot"></span>
              <span class="brevo-label">{{ pedidoService.modoSimulacion() ? 'Simulador' : 'Brevo Live' }}</span>
            </div>
            <button 
              class="brevo-toggle-btn"
              (click)="pedidoService.toggleModoSimulacion()"
              [title]="pedidoService.modoSimulacion() ? 'Cambiar a Brevo API Real' : 'Cambiar a Modo Simulación'">
              {{ pedidoService.modoSimulacion() ? 'API' : 'SIM' }}
            </button>
          </div>

          <!-- Widget de Sesión Activa / CTA Iniciar Sesión -->
          <div class="auth-action-box">
            @if (authService.usuarioActual(); as user) {
              <div class="user-luxury-pill" (click)="seleccionarTab('login')" title="Ver cuenta y Mis Pedidos">
                <div class="user-avatar-crest">👤</div>
                <div class="user-details">
                  <span class="user-name">{{ user.nombre }}</span>
                  <span class="user-role">{{ user.rol === 'ADMINISTRADOR' ? 'Master Admin' : 'Socio VIP' }}</span>
                </div>
              </div>
              <button class="btn-logout-luxury" (click)="authService.logout()" title="Cerrar sesión">
                ✕
              </button>
            } @else {
              <button class="btn-login-luxury" (click)="seleccionarTab('login')">
                <span class="btn-shimmer"></span>
                <span class="btn-text">Ingresar ✦</span>
              </button>
            }
          </div>

          <!-- Botón Hamburguesa para Móvil/Tablet -->
          <button 
            class="hamburger-btn show-tablet" 
            [class.open]="menuMovilAbierto()"
            (click)="menuMovilAbierto.set(!menuMovilAbierto())"
            aria-label="Abrir menú de navegación">
            <span class="ham-line"></span>
            <span class="ham-line"></span>
            <span class="ham-line"></span>
          </button>
        </div>
      </div>

      <!-- Menú Desplegable Móvil / Tablet (Glass Drawer) -->
      @if (menuMovilAbierto()) {
        <div class="mobile-drawer animate-slide-down show-tablet">
          <div class="mobile-drawer-inner">
            <div class="mobile-nav-links">
              <button 
                class="mobile-nav-item" 
                [class.active]="tabActiva() === 'menu'"
                (click)="seleccionarTab('menu')">
                <span class="m-icon">🍕</span>
                <span class="m-title">Menú & Carta</span>
                <span class="m-sub">Colección de autor</span>
              </button>

              <button 
                class="mobile-nav-item" 
                [class.active]="tabActiva() === 'promociones'"
                (click)="seleccionarTab('promociones')">
                <span class="m-icon">🏷️</span>
                <span class="m-title">Promociones 2x1</span>
                <span class="pill-badge-promo">Especial</span>
              </button>

              <button 
                class="mobile-nav-item" 
                [class.active]="tabActiva() === 'delivery'"
                (click)="seleccionarTab('delivery')">
                <span class="m-icon">🛵</span>
                <span class="m-title">Zonas de Delivery</span>
                <span class="m-sub">25-35 min</span>
              </button>

              <button 
                class="mobile-nav-item" 
                [class.active]="tabActiva() === 'login'"
                (click)="seleccionarTab('login')">
                <span class="m-icon">✨</span>
                <span class="m-title">Mi Cuenta & Mis Pedidos</span>
                @if (authService.sesionActiva()) {
                  <span class="dot-online"></span>
                }
              </button>

              @if (authService.esAdmin()) {
                <button 
                  class="mobile-nav-item admin-item" 
                  [class.active]="tabActiva() === 'admin'"
                  (click)="seleccionarTab('admin')">
                  <span class="m-icon">👑</span>
                  <div class="m-text-group">
                    <span class="m-title">Admin Cocina & Pedidos</span>
                    <span class="m-sub">Kitchen Display System (KDS) & Auditoría</span>
                  </div>
                  <span class="pill-badge-admin">KDS</span>
                </button>
              }

              <button 
                class="mobile-nav-item tech-item" 
                [class.active]="tabActiva() === 'tech_docs'"
                (click)="seleccionarTab('tech_docs')">
                <span class="m-icon">⚡</span>
                <div class="m-text-group">
                  <span class="m-title">Cómo Funciona</span>
                  <span class="m-sub">Arquitectura Hexagonal & Código Spring Boot</span>
                </div>
                <span class="dev-badge">DEV</span>
              </button>
            </div>

            <!-- Toggle Brevo en Móvil -->
            <div class="mobile-drawer-footer">
              <div class="mobile-brevo-row">
                <span class="brevo-label-m">Integración Notificaciones:</span>
                <button 
                  class="brevo-toggle-m" 
                  [class.is-sim]="pedidoService.modoSimulacion()"
                  (click)="pedidoService.toggleModoSimulacion()">
                  {{ pedidoService.modoSimulacion() ? 'Modo Simulador Local' : 'Brevo REST API Live' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    /* ================================================================
       TOP ANNOUNCEMENT MICRO-BAR (BLACK, RED & WHITE)
       ================================================================ */
    .top-announcement-bar {
      background: #000000;
      background: linear-gradient(90deg, #000000 0%, #0d0d0d 50%, #000000 100%);
      color: #94a3b8;
      font-size: 0.72rem;
      padding: 0.4rem 1.5rem;
      border-bottom: 1px solid rgba(220, 38, 38, 0.2);
      letter-spacing: 0.02em;
    }

    .announcement-content {
      max-width: 1360px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.25rem;
    }

    .ann-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }

    .ann-icon {
      font-size: 0.85rem;
    }

    .ann-text strong {
      color: #ffffff;
      font-weight: 600;
    }

    .red-text {
      color: #ff334b !important;
      letter-spacing: 0.5px;
    }

    .pulse-beacon {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
      animation: beaconPulse 2s infinite ease-in-out;
    }

    .pulse-beacon.red {
      background: #dc2626;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.9);
    }

    @keyframes beaconPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.35); opacity: 0.6; }
    }

    /* ================================================================
       MAIN HEADER & LUXURY CONTAINER (BLACK, RED & WHITE)
       ================================================================ */
    .navbar-header {
      background: rgba(8, 8, 8, 0.92);
      backdrop-filter: blur(28px) saturate(190%);
      -webkit-backdrop-filter: blur(28px) saturate(190%);
      border-bottom: 1px solid rgba(220, 38, 38, 0.2);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.03);
    }

    .navbar-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 0.65rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: nowrap;
    }

    /* ================================================================
       BRAND EMBLEM & TYPOGRAPHY
       ================================================================ */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
      text-decoration: none;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand:hover {
      transform: translateY(-1px);
    }

    .logo-crest {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #1c1c1c 0%, #080808 100%);
      border: 1.5px solid rgba(220, 38, 38, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.9), 0 0 16px rgba(220, 38, 38, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.25);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .brand:hover .logo-crest {
      border-color: #ef4444;
      box-shadow: 0 6px 24px rgba(220, 38, 38, 0.45), 0 0 25px rgba(220, 38, 38, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4);
      transform: translateY(-1px) scale(1.04);
    }

    .brand-logo-img {
      width: 34px;
      height: 34px;
      object-fit: contain;
      filter: brightness(0) invert(1) drop-shadow(0 2px 8px rgba(220, 38, 38, 0.65));
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .brand:hover .brand-logo-img {
      transform: scale(1.1) rotate(-3deg);
      filter: brightness(0) invert(1) drop-shadow(0 0 14px rgba(220, 38, 38, 0.95));
    }

    .crest-glow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle at top left, rgba(220, 38, 38, 0.35), transparent 70%);
      pointer-events: none;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title-group {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.62rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.015em;
    }

    .brand-accent {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 800;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #b91c1c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-left: 1px;
    }

    .brand-sparkle {
      font-size: 0.65rem;
      color: #ef4444;
      line-height: 1;
      opacity: 0.85;
      animation: sparkleGlow 3s infinite ease-in-out;
    }

    @keyframes sparkleGlow {
      0%, 100% { opacity: 0.4; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.15); }
    }

    .brand-subtitle {
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      font-size: 0.58rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 2.2px;
      margin-top: 4px;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .sub-bullet {
      color: #dc2626;
      font-size: 0.75rem;
    }

    /* ================================================================
       CENTER NAVIGATION: FLOATING GLASS PILL CAPSULE
       ================================================================ */
    .nav-pill-capsule {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(14, 14, 14, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      padding: 4px 6px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .nav-tab {
      background: transparent;
      border: 1px solid transparent;
      outline: none;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.46rem 1rem;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-weight: 500;
      color: #a1a1aa;
      cursor: pointer;
      position: relative;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      white-space: nowrap;
    }

    .nav-tab:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.06);
    }

    .nav-tab.active {
      color: #ffffff;
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.28) 0%, rgba(220, 38, 38, 0.1) 100%);
      border-color: rgba(220, 38, 38, 0.55);
      box-shadow: 0 0 16px rgba(220, 38, 38, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      font-weight: 600;
    }

    .tab-label {
      letter-spacing: 0.01em;
    }

    .pill-badge-promo {
      font-size: 0.6rem;
      font-weight: 800;
      background: #dc2626;
      color: #ffffff;
      padding: 0.12rem 0.45rem;
      border-radius: 9999px;
      letter-spacing: 0.04em;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
    }

    .dot-online {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #dc2626;
      box-shadow: 0 0 8px #dc2626;
      display: inline-block;
    }

    .tab-admin-vip {
      background: rgba(220, 38, 38, 0.12);
      border-color: rgba(220, 38, 38, 0.4);
      color: #fca5a5;
    }

    .tab-admin-vip:hover {
      background: rgba(220, 38, 38, 0.25);
      border-color: #ef4444;
      color: #ffffff;
    }

    .tab-admin-vip.active {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-color: #f87171;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
    }

    .pill-badge-admin {
      font-size: 0.62rem;
      font-weight: 800;
      background: #ffffff;
      color: #991b1b;
      padding: 0.1rem 0.45rem;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }

    .mobile-nav-item.admin-item {
      background: rgba(220, 38, 38, 0.1);
      border-color: rgba(220, 38, 38, 0.3);
    }

    /* ================================================================
       RIGHT ACTION HUB
       ================================================================ */
    .right-controls {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    /* Botón Especial: Cómo Funciona DEV Capsule */
    .btn-tech-capsule {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(14, 14, 14, 0.8);
      color: #f1f5f9;
      padding: 0.38rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .btn-tech-capsule:hover {
      background: rgba(24, 24, 24, 0.95);
      border-color: rgba(220, 38, 38, 0.6);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(220, 38, 38, 0.3);
    }

    .btn-tech-capsule.active {
      border-color: #dc2626;
      box-shadow: 0 0 16px rgba(220, 38, 38, 0.4);
      background: rgba(220, 38, 38, 0.15);
    }

    .tech-icon-glow {
      font-size: 0.95rem;
      filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.6));
    }

    .tech-btn-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .tech-title {
      font-size: 0.74rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.1;
    }

    .tech-sub {
      font-size: 0.6rem;
      color: #94a3b8;
    }

    .dev-badge {
      font-size: 0.58rem;
      font-weight: 800;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.45);
      color: #ff334b;
      padding: 0.08rem 0.32rem;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    /* Brevo Capsule */
    .brevo-capsule {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(14, 14, 14, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      padding: 0.3rem 0.55rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .brevo-status {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .brevo-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .brevo-status.is-real .brevo-dot {
      background: #ffffff;
      box-shadow: 0 0 6px #ffffff;
    }

    .brevo-status.is-real .brevo-label {
      color: #ffffff;
    }

    .brevo-status.is-sim .brevo-dot {
      background: #dc2626;
      box-shadow: 0 0 6px #dc2626;
    }

    .brevo-status.is-sim .brevo-label {
      color: #ff334b;
    }

    .brevo-toggle-btn {
      font-size: 0.65rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      padding: 0.12rem 0.42rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .brevo-toggle-btn:hover {
      background: rgba(220, 38, 38, 0.25);
      border-color: #dc2626;
    }

    /* Auth Action Box */
    .auth-action-box {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .user-luxury-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(14, 14, 14, 0.85);
      border: 1px solid rgba(220, 38, 38, 0.4);
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    .user-luxury-pill:hover {
      background: rgba(220, 38, 38, 0.15);
      border-color: #dc2626;
      box-shadow: 0 0 14px rgba(220, 38, 38, 0.35);
      transform: translateY(-1px);
    }

    .user-avatar-crest {
      font-size: 0.85rem;
      background: rgba(220, 38, 38, 0.25);
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .user-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.1;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-role {
      font-size: 0.58rem;
      font-weight: 600;
      color: #ff334b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-logout-luxury {
      background: rgba(220, 38, 38, 0.15);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.35);
      font-size: 0.7rem;
      font-weight: 700;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-logout-luxury:hover {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.6);
    }

    .btn-login-luxury {
      position: relative;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      box-shadow: 0 3px 15px rgba(220, 38, 38, 0.45);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .btn-login-luxury:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.65);
    }

    .btn-shimmer {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform: skewX(-20deg);
      transition: left 0.75s ease;
    }

    .btn-login-luxury:hover .btn-shimmer {
      left: 200%;
    }

    .btn-text {
      position: relative;
      z-index: 1;
      letter-spacing: 0.02em;
    }

    /* ================================================================
       HAMBURGER BUTTON & RESPONSIVE TOGGLES
       ================================================================ */
    .show-tablet {
      display: none !important;
    }

    .hamburger-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(14, 14, 14, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: none !important; /* STRICTLY HIDDEN ON DESKTOP */
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      padding: 0;
      transition: all 0.2s ease;
    }

    .hamburger-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(220, 38, 38, 0.5);
    }

    .ham-line {
      width: 18px;
      height: 2px;
      background: #ffffff;
      border-radius: 2px;
      transition: all 0.25s ease;
    }

    .hamburger-btn.open .ham-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .hamburger-btn.open .ham-line:nth-child(2) {
      opacity: 0;
    }

    .hamburger-btn.open .ham-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* ================================================================
       MOBILE GLASS DRAWER (BLACK, RED & WHITE)
       ================================================================ */
    .mobile-drawer {
      background: rgba(6, 6, 6, 0.96);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-bottom: 1px solid rgba(220, 38, 38, 0.25);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95);
      animation: drawerSlideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes drawerSlideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-drawer-inner {
      max-width: 1360px;
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      color: #cbd5e1;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
    }

    .mobile-nav-item:hover,
    .mobile-nav-item.active {
      background: rgba(220, 38, 38, 0.15);
      border-color: rgba(220, 38, 38, 0.45);
      color: #ffffff;
    }

    .m-icon {
      font-size: 1.2rem;
    }

    .m-title {
      font-size: 0.92rem;
      font-weight: 600;
      flex: 1;
    }

    .m-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .mobile-nav-item.tech-item {
      border-color: rgba(220, 38, 38, 0.3);
      background: rgba(220, 38, 38, 0.05);
    }

    .mobile-nav-item.tech-item.active {
      border-color: #dc2626;
      background: rgba(220, 38, 38, 0.18);
    }

    .m-text-group {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .mobile-drawer-footer {
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .mobile-brevo-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .brevo-label-m {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .brevo-toggle-m {
      background: rgba(220, 38, 38, 0.2);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.4);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }

    .brevo-toggle-m.is-sim {
      background: rgba(220, 38, 38, 0.1);
      color: #ff334b;
      border-color: rgba(220, 38, 38, 0.35);
    }

    /* ================================================================
       MEDIA QUERIES (NO-WRAP GUARANTEE)
       ================================================================ */
    @media (max-width: 1200px) {
      .hide-laptop {
        display: none !important;
      }
    }

    @media (max-width: 980px) {
      .hide-tablet {
        display: none !important;
      }
      .show-tablet, .hamburger-btn {
        display: flex !important;
      }
      .brand-subtitle {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .hide-mobile {
        display: none !important;
      }
      .navbar-container {
        padding: 0.55rem 1rem;
      }
      .brand-title {
        font-size: 1.35rem;
      }
      .logo-crest {
        width: 38px;
        height: 38px;
      }
      .brand-logo-img {
        width: 24px;
        height: 24px;
      }
      .btn-login-luxury {
        padding: 0.42rem 0.95rem;
        font-size: 0.76rem;
      }
    }
  `]
})
export class NavbarComponent {
  readonly tabActiva = input.required<string>();
  readonly tabSeleccionada = output<string>();

  readonly pedidoService = inject(PedidoService);
  readonly authService = inject(AuthService);

  readonly menuMovilAbierto = signal<boolean>(false);

  seleccionarTab(tab: string): void {
    this.menuMovilAbierto.set(false);
    this.tabSeleccionada.emit(tab);
  }
}


