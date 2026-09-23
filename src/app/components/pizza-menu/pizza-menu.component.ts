import { Component, ElementRef, ViewChild, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { SaborPizza } from '../../models/pedido.model';

@Component({
  selector: 'app-pizza-menu',
  imports: [CommonModule],
  template: `
    <section class="menu-section">
      <div class="menu-header">
        <span class="section-badge">Carta d'Autore • Forno a Legna 400°C</span>
        <h2 class="menu-title">Pizze Artigianali a Lunga Lievitazione</h2>
        <p class="menu-description">
          Elaboradas a mano diariamente con masa madre viva de fermentación lenta de 48 horas, harina de trigo no refinada 
          y horneadas al fuego de leña. Cada pizza incluye confirmación automática por correo vía Brevo REST API v3.
        </p>

        <!-- Filtros y Selector de Vista (Carrusel / Cuadrícula) -->
        <div class="filters-and-modes-bar">
          <!-- Filtros por Categoría -->
          <div class="category-filters">
            <button 
              class="filter-pill" 
              [class.active]="filtroActivo() === 'todas'"
              (click)="filtroActivo.set('todas')">
              <span>Tutte le Pizze ({{ pedidoService.catalogoPizzas.length }})</span>
            </button>

            <button 
              class="filter-pill" 
              [class.active]="filtroActivo() === 'populares'"
              (click)="filtroActivo.set('populares')">
              <span>⭐ I Più Venduti</span>
            </button>

            <button 
              class="filter-pill" 
              [class.active]="filtroActivo() === 'veggie'"
              (click)="filtroActivo.set('veggie')">
              <span>🌱 Vegetariane</span>
            </button>

            <button 
              class="filter-pill" 
              [class.active]="filtroActivo() === 'picante'"
              (click)="filtroActivo.set('picante')">
              <span>🌶️ Fuoco</span>
            </button>
          </div>

          <!-- Selector de Modo de Visualización -->
          <div class="view-mode-toggle">
            <button 
              type="button"
              class="mode-btn" 
              [class.active]="modoVista() === 'carrusel'"
              (click)="modoVista.set('carrusel')"
              title="Vista Carrusel Horizontal Fluido">
              <span>🎠 Carrusel</span>
            </button>
            <button 
              type="button"
              class="mode-btn" 
              [class.active]="modoVista() === 'grid'"
              (click)="modoVista.set('grid')"
              title="Vista Cuadrícula Completa">
              <span>⊞ Cuadrícula</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MODO 1: CARRUSEL INTERACTIVO CON FLECHAS FLOTANTES -->
      @if (modoVista() === 'carrusel') {
        <div class="carousel-outer-container animate-fade-in">
          
          <!-- Flecha Izquierda -->
          <button 
            type="button" 
            class="carousel-nav-btn btn-prev" 
            (click)="scrollCarrusel(-1)"
            aria-label="Ver pizza anterior">
            <span>‹</span>
          </button>

          <!-- Track Deslizable Horizontal -->
          <div #carouselTrack class="carousel-track-container" (scroll)="onScrollTrack()">
            @for (pizza of pizzasFiltradas(); track pizza.id; let idx = $index) {
              <article class="pizza-card carousel-card hover-lift" [class.popular-card]="pizza.popular">
                @if (pizza.popular) {
                  <div class="card-ribbon">PREMIATA</div>
                }

                <!-- Fotografía Culinaria -->
                <div class="pizza-photo-box">
                  @if (pizza.fotoUrl) {
                    <img [src]="pizza.fotoUrl" [alt]="pizza.nombre" class="pizza-card-img" loading="lazy" />
                  } @else {
                    <div class="pizza-emoji-placeholder">{{ pizza.imagen }}</div>
                  }
                  <div class="photo-gradient-overlay"></div>

                  <div class="pizza-pricing-float">
                    <span class="currency">$</span>
                    <span class="amount">{{ pizza.precio | number:'1.2-2' }}</span>
                  </div>

                  @if (pizza.calorias) {
                    <div class="cal-badge">
                      <span>🔥 {{ pizza.calorias }} kcal</span>
                    </div>
                  }
                </div>

                <div class="pizza-card-body">
                  <div class="pizza-title-row">
                    <div>
                      <h3 class="pizza-name">{{ pizza.nombre }}</h3>
                      @if (pizza.subtituloItaliano) {
                        <span class="italian-subtitle">{{ pizza.subtituloItaliano }}</span>
                      }
                    </div>
                    <div class="badge-group">
                      @if (pizza.vegetariana) {
                        <span class="tag-pill tag-veggie" title="Vegetariana">🌱 Veggie</span>
                      }
                      @if (pizza.picante) {
                        <span class="tag-pill tag-spicy" title="Picante">🌶️ Piccante</span>
                      }
                    </div>
                  </div>

                  <p class="pizza-desc">{{ pizza.descripcion }}</p>

                  <div class="ingredients-list">
                    <span class="ingredients-label">Ingredienti Selezionati:</span>
                    <div class="ing-tags">
                      @for (ing of pizza.ingredientes; track ing) {
                        <span class="ing-tag">{{ ing }}</span>
                      }
                    </div>
                  </div>

                  @if (pizza.maridajeRecomendado) {
                    <div class="wine-pairing-box">
                      <span class="wine-icon">🍷</span>
                      <span class="wine-text">{{ pizza.maridajeRecomendado }}</span>
                    </div>
                  }
                </div>

                <div class="pizza-card-footer">
                  <button 
                    class="btn-detail-modal"
                    (click)="abrirDetalle(pizza)"
                    type="button"
                    title="Personalizar masa, bordes e ingredientes gourmet">
                    <span>Personalizar</span>
                  </button>

                  <button 
                    class="btn-select-pizza btn-shimmer"
                    (click)="seleccionar(pizza)"
                    type="button">
                    <span>Pedir Ahora</span>
                    <span class="arrow-icon">→</span>
                  </button>
                </div>
              </article>
            }
          </div>

          <!-- Flecha Derecha -->
          <button 
            type="button" 
            class="carousel-nav-btn btn-next" 
            (click)="scrollCarrusel(1)"
            aria-label="Ver siguiente pizza">
            <span>›</span>
          </button>
        </div>

        <!-- Indicador de desplazamiento / Ayuda táctil -->
        <div class="carousel-hint-bar">
          <span class="hint-arrow">‹</span>
          <span class="hint-text">Desliza o usa las flechas para explorar toda la carta de autor</span>
          <span class="hint-arrow">›</span>
        </div>
      }

      <!-- MODO 2: CUADRÍCULA ESTÁNDAR -->
      @if (modoVista() === 'grid') {
        <div class="pizza-grid animate-fade-in">
          @for (pizza of pizzasFiltradas(); track pizza.id) {
            <article class="pizza-card hover-lift" [class.popular-card]="pizza.popular">
              @if (pizza.popular) {
                <div class="card-ribbon">PREMIATA</div>
              }

              <div class="pizza-photo-box">
                @if (pizza.fotoUrl) {
                  <img [src]="pizza.fotoUrl" [alt]="pizza.nombre" class="pizza-card-img" loading="lazy" />
                } @else {
                  <div class="pizza-emoji-placeholder">{{ pizza.imagen }}</div>
                }
                <div class="photo-gradient-overlay"></div>

                <div class="pizza-pricing-float">
                  <span class="currency">$</span>
                  <span class="amount">{{ pizza.precio | number:'1.2-2' }}</span>
                </div>

                @if (pizza.calorias) {
                  <div class="cal-badge">
                    <span>🔥 {{ pizza.calorias }} kcal</span>
                  </div>
                }
              </div>

              <div class="pizza-card-body">
                <div class="pizza-title-row">
                  <div>
                    <h3 class="pizza-name">{{ pizza.nombre }}</h3>
                    @if (pizza.subtituloItaliano) {
                      <span class="italian-subtitle">{{ pizza.subtituloItaliano }}</span>
                    }
                  </div>
                  <div class="badge-group">
                    @if (pizza.vegetariana) {
                      <span class="tag-pill tag-veggie">🌱 Veggie</span>
                    }
                    @if (pizza.picante) {
                      <span class="tag-pill tag-spicy">🌶️ Piccante</span>
                    }
                  </div>
                </div>

                <p class="pizza-desc">{{ pizza.descripcion }}</p>

                <div class="ingredients-list">
                  <span class="ingredients-label">Ingredienti Selezionati:</span>
                  <div class="ing-tags">
                    @for (ing of pizza.ingredientes; track ing) {
                      <span class="ing-tag">{{ ing }}</span>
                    }
                  </div>
                </div>

                @if (pizza.maridajeRecomendado) {
                  <div class="wine-pairing-box">
                    <span class="wine-icon">🍷</span>
                    <span class="wine-text">{{ pizza.maridajeRecomendado }}</span>
                  </div>
                }
              </div>

              <div class="pizza-card-footer">
                <button 
                  class="btn-detail-modal"
                  (click)="abrirDetalle(pizza)"
                  type="button">
                  <span>Personalizar</span>
                </button>

                <button 
                  class="btn-select-pizza btn-shimmer"
                  (click)="seleccionar(pizza)"
                  type="button">
                  <span>Pedir Ahora</span>
                  <span class="arrow-icon">→</span>
                </button>
              </div>
            </article>
          }
        </div>
      }

    </section>
  `,
  styles: [`
    .menu-section {
      margin-bottom: 5rem;
      position: relative;
    }

    .menu-header {
      text-align: center;
      max-width: 820px;
      margin: 0 auto 3rem;
    }

    .section-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #ef4444;
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.25);
      padding: 0.35rem 0.95rem;
      border-radius: 9999px;
      margin-bottom: 0.85rem;
    }

    .menu-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.85rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .menu-description {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    /* Barra de Filtros y Selector de Modo */
    .filters-and-modes-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
    }

    .category-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.82rem;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .filter-pill:hover {
      border-color: rgba(220, 38, 38, 0.4);
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-1px);
    }

    .filter-pill.active {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
    }

    .view-mode-toggle {
      display: flex;
      background: #090a0f;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 3px;
      gap: 2px;
    }

    .mode-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-btn.active {
      background: rgba(220, 38, 38, 0.2);
      color: #ffffff;
      border: 1px solid rgba(220, 38, 38, 0.4);
    }

    /* ================================================================= */
    /* CARRUSEL HORIZONTAL FLUIDO                                       */
    /* ================================================================= */
    .carousel-outer-container {
      position: relative;
      width: 100%;
      padding: 0.5rem 0;
    }

    .carousel-track-container {
      display: flex;
      gap: 1.5rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 1.25rem 0.5rem 2rem;
      scroll-behavior: smooth;
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE/Edge */
    }

    .carousel-track-container::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
    }

    .carousel-card {
      flex: 0 0 350px;
      max-width: 350px;
      scroll-snap-align: start;
    }

    @media (max-width: 640px) {
      .carousel-card {
        flex: 0 0 84vw;
        max-width: 84vw;
      }
    }

    /* Botones de Navegación del Carrusel */
    .carousel-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(14, 14, 14, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(220, 38, 38, 0.35);
      color: #ffffff;
      font-size: 1.8rem;
      font-weight: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 20;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7), 0 0 20px rgba(220, 38, 38, 0.15);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .carousel-nav-btn:hover {
      background: #dc2626;
      border-color: #dc2626;
      color: #ffffff;
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 30px rgba(220, 38, 38, 0.35);
    }

    .btn-prev {
      left: -18px;
    }

    .btn-next {
      right: -18px;
    }

    @media (max-width: 768px) {
      .btn-prev { left: 4px; }
      .btn-next { right: 4px; }
    }

    .carousel-hint-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-top: -0.5rem;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .hint-arrow {
      color: #ef4444;
      font-size: 1rem;
      animation: pulseArrow 1.8s infinite ease-in-out;
    }

    @keyframes pulseArrow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }

    /* ================================================================= */
    /* CUADRÍCULA ESTÁNDAR                                              */
    /* ================================================================= */
    .pizza-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2.25rem;
    }

    /* Tarjetas de Pizza */
    .pizza-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pizza-card:hover {
      border-color: rgba(220, 38, 38, 0.4);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(220, 38, 38, 0.15);
    }

    .popular-card {
      border-color: rgba(220, 38, 38, 0.35);
      box-shadow: 0 15px 35px -5px rgba(220, 38, 38, 0.2);
    }

    .card-ribbon {
      position: absolute;
      top: 14px;
      right: -32px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 0.3rem 2.5rem;
      transform: rotate(45deg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      letter-spacing: 1px;
      z-index: 10;
    }

    /* Foto Culinaria */
    .pizza-photo-box {
      width: 100%;
      height: 230px;
      position: relative;
      overflow: hidden;
      background: #0d0d0d;
    }

    .pizza-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pizza-card:hover .pizza-card-img {
      transform: scale(1.08) rotate(1deg);
    }

    .pizza-emoji-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 5rem;
      background: radial-gradient(circle, #222222 0%, #0d0d0d 100%);
    }

    .photo-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #121212 0%, transparent 60%);
      pointer-events: none;
    }

    .pizza-pricing-float {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(9, 10, 15, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(220, 38, 38, 0.4);
      padding: 0.35rem 0.75rem;
      border-radius: 12px;
      color: #f8fafc;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      z-index: 2;
    }

    .pizza-pricing-float .currency {
      color: #ef4444;
      font-size: 0.85rem;
      margin-right: 1px;
    }

    .pizza-pricing-float .amount {
      font-size: 1.15rem;
    }

    .cal-badge {
      position: absolute;
      bottom: 12px;
      right: 14px;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 2;
    }

    /* Cuerpo de la Card */
    .pizza-card-body {
      padding: 1.5rem 1.6rem 1rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .pizza-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .pizza-name {
      font-family: 'Playfair Display', serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      line-height: 1.2;
    }

    .italian-subtitle {
      display: block;
      font-size: 0.8rem;
      color: #ef4444;
      font-style: italic;
      margin-top: 2px;
    }

    .badge-group {
      display: flex;
      gap: 0.3rem;
    }

    .tag-pill {
      font-size: 0.68rem;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      font-weight: 600;
    }

    .tag-veggie {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .tag-spicy {
      background: rgba(220, 38, 38, 0.15);
      color: #f87171;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .pizza-desc {
      color: #94a3b8;
      font-size: 0.86rem;
      line-height: 1.5;
      margin: 0.5rem 0 1.15rem;
    }

    .ingredients-list {
      margin-top: auto;
      margin-bottom: 0.9rem;
    }

    .ingredients-label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 0.4rem;
      font-weight: 600;
    }

    .ing-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .ing-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.07);
      color: #cbd5e1;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .wine-pairing-box {
      background: rgba(220, 38, 38, 0.08);
      border-left: 2px solid #dc2626;
      padding: 0.4rem 0.65rem;
      border-radius: 0 6px 6px 0;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.75rem;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    /* Footer de la Card */
    .pizza-card-footer {
      padding: 1rem 1.6rem 1.4rem;
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-detail-modal {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
      padding: 0.7rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-detail-modal:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    .btn-select-pizza {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: #ffffff;
      border: none;
      padding: 0.7rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.86rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
    }

    .arrow-icon {
      transition: transform 0.2s ease;
    }

    .btn-select-pizza:hover .arrow-icon {
      transform: translateX(3px);
    }
  `]
})
export class PizzaMenuComponent {
  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly saborSeleccionado = output<SaborPizza>();
  readonly verDetalle = output<SaborPizza>();

  readonly pedidoService = inject(PedidoService);
  readonly filtroActivo = signal<'todas' | 'populares' | 'veggie' | 'picante'>('todas');
  readonly modoVista = signal<'carrusel' | 'grid'>('carrusel');

  pizzasFiltradas(): SaborPizza[] {
    const catalogo = this.pedidoService.catalogoPizzas;
    switch (this.filtroActivo()) {
      case 'populares':
        return catalogo.filter(p => p.popular);
      case 'veggie':
        return catalogo.filter(p => p.vegetariana);
      case 'picante':
        return catalogo.filter(p => p.picante);
      default:
        return catalogo;
    }
  }

  scrollCarrusel(direccion: number): void {
    if (this.carouselTrack) {
      const el = this.carouselTrack.nativeElement;
      const cardWidth = 374; // 350px card + 24px gap
      el.scrollBy({ left: direccion * cardWidth, behavior: 'smooth' });
    }
  }

  onScrollTrack(): void {
    // Escucha eventos de scroll para sincronización fluida si se requiere
  }

  seleccionar(pizza: SaborPizza): void {
    this.saborSeleccionado.emit(pizza);
  }

  abrirDetalle(pizza: SaborPizza): void {
    this.verDetalle.emit(pizza);
  }
}
