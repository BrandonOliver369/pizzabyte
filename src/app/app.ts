import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PedidoFormComponent } from './components/pedido-form/pedido-form.component';
import { MailNotificationComponent } from './components/mail-notification/mail-notification.component';
import { LoginComponent } from './components/login/login.component';
import { TechDocsComponent } from './components/tech-docs/tech-docs.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { SaborPizza, Pedido } from './models/pedido.model';
import { PedidoService } from './services/pedido.service';
import { AuthService } from './services/auth.service';

interface CuponInfo {
  codigo: string;
  titulo: string;
  descripcion: string;
  descuento: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    PedidoFormComponent,
    MailNotificationComponent,
    LoginComponent,
    TechDocsComponent,
    AdminDashboardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly title = signal('PizzaByte - Pizzería Artesanal');
  readonly tabActiva = signal<string>('menu');
  readonly pizzaSeleccionada = signal<SaborPizza | null>(null);

  readonly pedidoService = inject(PedidoService);
  readonly authService = inject(AuthService);

  // SCROLL-DRIVEN TRANSFORMATION & SHOWCASE DINÁMICO
  // SCROLL-DRIVEN TRANSFORMATION & SHOWCASE DINÁMICO (APPLE SCROLLYTELLING)
  readonly scrollY = signal<number>(0);
  readonly windowWidth = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  readonly pizzaEnShowcase = signal<SaborPizza>(this.pedidoService.catalogoPizzas[0]);
  readonly filtroShowcase = signal<'todas' | 'populares' | 'veggie' | 'picante'>('todas');
  readonly rotacionShowcase = signal<number>(0);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.scrollY.set(window.scrollY);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined') {
      this.windowWidth.set(window.innerWidth);
    }
  }

  // Progreso de transición de Hero a Catálogo (0 = Centrado en Hero, 1 = En vitrina lateral)
  readonly scrollProgress = computed(() => {
    const y = this.scrollY();
    const start = 15;
    const end = 440;
    if (y <= start) return 0;
    if (y >= end) return 1;
    return (y - start) / (end - start);
  });

  // Transformación 3D de la Pizza que viaja armónicamente del Centro al Costado Izquierdo
  readonly pizzaTransformStyle = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    const p = this.scrollProgress();

    if (!isDesktop) {
      return 'translate3d(0px, 0px, 0px) scale(1)';
    }

    // Centrado dinámico respecto al contenedor general (max 1240px)
    const containerWidth = Math.min(this.windowWidth() - 48, 1240);
    const maxShift = Math.max((containerWidth / 2) - 220, 0);

    // Easing suave cuadrático para el viaje de la pizza hacia la izquierda
    const easeProgress = Math.pow(1 - p, 1.25);
    const shiftX = Math.round(easeProgress * maxShift);
    const scale = 0.96 + (1 - p) * 0.08; // 1.04 en Hero centrado -> 0.96 en Vitrina lateral

    return `translate3d(${shiftX}px, 0px, 0px) scale(${scale})`;
  });

  // Desvanecimiento progresivo del texto y badges del Hero en Desktop
  readonly heroOpacity = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 1;
    const p = this.scrollProgress();
    return Math.max(1 - p * 2.2, 0);
  });

  readonly heroTransform = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 'none';
    const p = this.scrollProgress();
    return `translate3d(0px, -${p * 35}px, 0px)`;
  });

  // Visibilidad del catálogo: emerge con suavidad a medida que la pizza despeja la derecha
  readonly catalogOpacity = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 1;
    const p = this.scrollProgress();
    if (p <= 0.25) return 0;
    return Math.min((p - 0.25) / 0.55, 1);
  });

  readonly catalogTransform = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 'none';
    const p = this.scrollProgress();
    if (p <= 0.25) return 'translate3d(0px, 25px, 0px)';
    const prog = Math.min((p - 0.25) / 0.55, 1);
    return `translate3d(0px, ${(1 - prog) * 25}px, 0px)`;
  });

  // Visibilidad de la ficha de vitrina: aparece solo cuando la pizza llega a su columna izquierda
  readonly infoCardOpacity = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 1;
    const p = this.scrollProgress();
    if (p <= 0.50) return 0;
    return Math.min((p - 0.50) / 0.40, 1);
  });

  readonly infoCardTransform = computed(() => {
    const isDesktop = this.windowWidth() > 1120;
    if (!isDesktop) return 'none';
    const p = this.scrollProgress();
    if (p <= 0.50) return 'translate3d(0px, 20px, 0px)';
    const prog = Math.min((p - 0.50) / 0.40, 1);
    return `translate3d(0px, ${(1 - prog) * 20}px, 0px)`;
  });

  pizzasShowcaseFiltradas(): SaborPizza[] {
    const catalogo = this.pedidoService.catalogoPizzas;
    switch (this.filtroShowcase()) {
      case 'populares': return catalogo.filter(p => p.popular);
      case 'veggie': return catalogo.filter(p => p.vegetariana);
      case 'picante': return catalogo.filter(p => p.picante);
      default: return catalogo;
    }
  }

  seleccionarPizzaShowcase(pizza: SaborPizza): void {
    if (this.pizzaEnShowcase()?.id !== pizza.id) {
      this.rotacionShowcase.update(r => r + 45);
      this.pizzaEnShowcase.set(pizza);
    }
  }

  // MODAL DE DETALLE Y PERSONALIZACIÓN DE PIZZA (ATELIER D'AUTORE)
  readonly modalPedidoAbierto = signal<boolean>(false);
  readonly modalPizzaAbierto = signal<boolean>(false);
  readonly pizzaEnModal = signal<SaborPizza | null>(null);
  readonly masaSeleccionada = signal<'tradicional' | 'borde_queso' | 'fina'>('tradicional');
  readonly extraQueso = signal<boolean>(false);
  readonly extraChampinones = signal<boolean>(false);
  readonly extraJalapenos = signal<boolean>(false);
  readonly extraTocino = signal<boolean>(false);
  readonly extraTrufa = signal<boolean>(false);
  readonly notasCocina = signal<string>('');
  readonly cantidad = signal<number>(1);

  // MODAL DE CUPÓN
  readonly modalCuponAbierto = signal<boolean>(false);
  readonly cuponActual = signal<CuponInfo | null>(null);
  readonly cuponCopiado = signal<boolean>(false);

  // CARRITO FLOTANTE / SLIDE-OVER DRAWER
  readonly drawerCarritoAbierto = signal<boolean>(false);

  // TOAST FLOTANTE DE NOTIFICACIÓN
  readonly toastMensaje = signal<string | null>(null);

  // PRECIO CALCULADO DINÁMICO EN EL MODAL DE DETALLE
  readonly precioModalCalculado = computed(() => {
    const pizza = this.pizzaEnModal();
    if (!pizza) return 12.99;

    let base = pizza.precio;
    if (this.masaSeleccionada() === 'borde_queso') base += 2.50;
    if (this.extraQueso()) base += 1.50;
    if (this.extraChampinones()) base += 1.00;
    if (this.extraJalapenos()) base += 0.80;
    if (this.extraTocino()) base += 1.20;
    if (this.extraTrufa()) base += 1.75;

    return Number((base * this.cantidad()).toFixed(2));
  });

  async ngOnInit(): Promise<void> {
    // Verifica sesiones persistentes previas (Cookie 7 días)
    await this.authService.verificarSesionCookie();

    // Detección de ruta secreta / directa de Administración KDS (#admin o ?admin=true)
    if (typeof window !== 'undefined') {
      const verificarRutaAdmin = () => {
        const hash = window.location.hash;
        const search = window.location.search;
        if (hash === '#admin' || hash === '#kds' || search.includes('admin=true')) {
          this.tabActiva.set('admin');
        }
      };

      verificarRutaAdmin();
      window.addEventListener('hashchange', verificarRutaAdmin);
    }
  }

  cambiarTab(tab: string): void {
    if (tab === 'historial') {
      this.tabActiva.set('login');
    } else {
      this.tabActiva.set(tab);
    }

    if (typeof window !== 'undefined') {
      if (tab === 'admin') {
        window.location.hash = 'admin';
      } else if (window.location.hash === '#admin' || window.location.hash === '#kds') {
        history.replaceState(null, '', window.location.pathname + window.location.search.replace(/[?&]admin=true/, ''));
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollAlMenu(): void {
    this.tabActiva.set('menu');
    setTimeout(() => {
      const el = document.getElementById('catalogo-menu');
      if (el) {
        const isDesktop = typeof window !== 'undefined' && window.innerWidth > 1120;
        const targetOffset = isDesktop ? 460 : 0;
        const top = el.getBoundingClientRect().top + window.scrollY + targetOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 80);
  }

  alSeleccionarPizza(pizza: SaborPizza): void {
    this.pizzaSeleccionada.set(pizza);
    this.modalPedidoAbierto.set(true);
  }

  abrirModalPedido(pizza?: SaborPizza): void {
    if (pizza) {
      this.pizzaSeleccionada.set(pizza);
    }
    this.modalPedidoAbierto.set(true);
  }

  cerrarModalPedido(): void {
    this.modalPedidoAbierto.set(false);
  }

  alCompletarPedido(pedido: Pedido): void {
    this.modalPedidoAbierto.set(false);
    this.mostrarToast(`✨ ¡Orden #${pedido.id} confirmada con éxito! Revisa tu correo.`);
  }

  abrirDetallePizza(pizza: SaborPizza): void {
    this.pizzaSeleccionada.set(pizza);
    this.modalPedidoAbierto.set(true);
  }

  cerrarModalPizza(): void {
    this.modalPizzaAbierto.set(false);
  }

  confirmarDesdeModal(): void {
    const pizza = this.pizzaEnModal();
    if (pizza) {
      const masaNombres = {
        'tradicional': 'Napolitana Tradicional',
        'borde_queso': 'Borde Relleno Fior di Latte',
        'fina': 'Crocante al Carbón'
      };
      const extras: string[] = [];
      if (this.extraQueso()) extras.push('Extra Fior di Latte');
      if (this.extraChampinones()) extras.push('Champiñones al Romero');
      if (this.extraJalapenos()) extras.push('Jalapeños Ahumados');
      if (this.extraTocino()) extras.push('Tocino Crujiente');
      if (this.extraTrufa()) extras.push('Aceite de Trufa Blanca');

      const pizzaPersonalizada: SaborPizza = {
        ...pizza,
        nombre: `${pizza.nombre} (${masaNombres[this.masaSeleccionada()]})`,
        precio: Number((this.precioModalCalculado() / this.cantidad()).toFixed(2)),
        ingredientes: extras.length > 0 ? [...pizza.ingredientes, ...extras] : pizza.ingredientes
      };

      this.pizzaSeleccionada.set(pizzaPersonalizada);
      this.modalPizzaAbierto.set(false);
      this.tabActiva.set('menu');
      this.mostrarToast(`✨ ¡${pizza.nombre} personalizada agregada a tu orden!`);
      setTimeout(() => {
        const el = document.getElementById('formulario-pedido');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }

  seleccionarCombo(nombreCombo: string, precio: number, saborSugerido: string): void {
    const pizza = this.pedidoService.catalogoPizzas.find(p => p.nombre.toLowerCase().includes(saborSugerido.toLowerCase())) 
      || this.pedidoService.catalogoPizzas[0];
    
    this.pizzaSeleccionada.set({
      ...pizza,
      nombre: `${nombreCombo} (${pizza.nombre})`,
      precio: precio
    });
    this.modalPedidoAbierto.set(true);
  }

  abrirModalCupon(codigo: string, titulo: string, descripcion: string, descuento: string): void {
    this.cuponActual.set({ codigo, titulo, descripcion, descuento });
    this.cuponCopiado.set(false);
    this.modalCuponAbierto.set(true);
  }

  cerrarModalCupon(): void {
    this.modalCuponAbierto.set(false);
  }

  copiarCupon(codigo: string): void {
    navigator.clipboard.writeText(codigo).then(() => {
      this.cuponCopiado.set(true);
      this.mostrarToast(`🎟️ Cupón ${codigo} copiado al portapapeles`);
      setTimeout(() => this.cuponCopiado.set(false), 3000);
    });
  }

  toggleCarrito(): void {
    this.drawerCarritoAbierto.update(v => !v);
  }

  mostrarToast(mensaje: string): void {
    this.toastMensaje.set(mensaje);
    setTimeout(() => {
      if (this.toastMensaje() === mensaje) {
        this.toastMensaje.set(null);
      }
    }, 4500);
  }

  obtenerUltimoPedido(): Pedido | null {
    const pedidos = this.pedidoService.pedidos();
    return pedidos.length > 0 ? pedidos[0] : null;
  }
}
