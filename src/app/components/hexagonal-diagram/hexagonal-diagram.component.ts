import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HexNode {
  id: string;
  nombre: string;
  capa: 'DOMINIO' | 'APLICACION' | 'INFRAESTRUCTURA';
  tipo: 'ENTIDAD' | 'PUERTO' | 'CASO_DE_USO' | 'ADAPTADOR_ENTRADA' | 'ADAPTADOR_SALIDA';
  archivo: string;
  icono: string;
  codigo: string;
  explicacion: string[];
}

@Component({
  selector: 'app-hexagonal-diagram',
  imports: [CommonModule],
  template: `
    <div class="hex-container">
      <div class="hex-header">
        <span class="hex-badge">Patrón Puertos y Adaptadores</span>
        <h2 class="hex-title">Arquitectura Hexagonal en PizzaByte</h2>
        <p class="hex-subtitle">
          El núcleo (Dominio y Casos de Uso) es agnóstico a frameworks y herramientas externas. 
          Haz clic en cualquier componente para ver su código Java puro y explicación paso a paso.
        </p>
      </div>

      <!-- Interactive Diagram Layout -->
      <div class="diagram-grid">
        <!-- Adaptadores de Entrada -->
        <div class="diagram-column adapter-in-col">
          <div class="col-title">
            <span class="pill-type in">Adaptador de Entrada (HTTP)</span>
            <h3>Infraestructura</h3>
          </div>

          <div 
            class="node-card"
            [class.active]="nodoActivo().id === 'controller'"
            (click)="seleccionarNodo('controller')">
            <div class="node-icon">🌐</div>
            <div class="node-info">
              <span class="node-layer">REST Controller</span>
              <strong class="node-name">PedidoController.java</strong>
              <span class="node-desc">POST /api/pizzas/ordenar</span>
            </div>
            <div class="arrow-out">➜</div>
          </div>

          <div class="node-client-preview">
            <div class="client-badge">🅰️ Angular Frontend</div>
            <span class="client-detail">Envía JSON al controller</span>
          </div>
        </div>

        <!-- Centro: Aplicación y Dominio -->
        <div class="diagram-column core-col">
          <div class="col-title">
            <span class="pill-type core">El Núcleo Puro</span>
            <h3>Aplicación & Dominio</h3>
          </div>

          <!-- Caso de uso -->
          <div 
            class="node-card usecase-card"
            [class.active]="nodoActivo().id === 'usecase'"
            (click)="seleccionarNodo('usecase')">
            <div class="node-icon">⚙️</div>
            <div class="node-info">
              <span class="node-layer">Caso de Uso (Aplicación)</span>
              <strong class="node-name">CrearPedidoUseCase.java</strong>
              <span class="node-desc">Orquesta guardar y notificar</span>
            </div>
          </div>

          <!-- Dominio (Entidad + Puertos) -->
          <div class="domain-box">
            <div class="domain-title">Capa de Dominio (Sin dependencias externas)</div>

            <div 
              class="node-card domain-card"
              [class.active]="nodoActivo().id === 'entidad'"
              (click)="seleccionarNodo('entidad')">
              <div class="node-icon">📦</div>
              <div class="node-info">
                <span class="node-layer">Entidad POJO</span>
                <strong class="node-name">Pedido.java</strong>
                <span class="node-desc">id, saborPizza, correoCliente</span>
              </div>
            </div>

            <div class="ports-grid">
              <div 
                class="node-card port-card"
                [class.active]="nodoActivo().id === 'port-repo'"
                (click)="seleccionarNodo('port-repo')">
                <div class="node-icon">🔌</div>
                <div class="node-info">
                  <span class="node-layer">Puerto Salida</span>
                  <strong class="node-name">PedidoRepositoryPort</strong>
                </div>
              </div>

              <div 
                class="node-card port-card"
                [class.active]="nodoActivo().id === 'port-notif'"
                (click)="seleccionarNodo('port-notif')">
                <div class="node-icon">🔌</div>
                <div class="node-info">
                  <span class="node-layer">Puerto Salida</span>
                  <strong class="node-name">NotificacionPort</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Adaptadores de Salida -->
        <div class="diagram-column adapter-out-col">
          <div class="col-title">
            <span class="pill-type out">Adaptadores de Salida</span>
            <h3>Infraestructura</h3>
          </div>

          <div 
            class="node-card"
            [class.active]="nodoActivo().id === 'adapter-db'"
            (click)="seleccionarNodo('adapter-db')">
            <div class="node-icon">🗄️</div>
            <div class="node-info">
              <span class="node-layer">Adaptador JPA / SQL</span>
              <strong class="node-name">PedidoDatabaseAdapter.java</strong>
              <span class="node-desc">Implementa PedidoRepositoryPort</span>
            </div>
          </div>

          <div 
            class="node-card highlight-smtp"
            [class.active]="nodoActivo().id === 'adapter-mail'"
            (click)="seleccionarNodo('adapter-mail')">
            <div class="smtp-tag">✨ Objetivo del Ejercicio</div>
            <div class="node-icon">✉️</div>
            <div class="node-info">
              <span class="node-layer">Adaptador SMTP / Correo</span>
              <strong class="node-name">MailAdapter.java</strong>
              <span class="node-desc">Implementa NotificacionPort</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Code & Details Viewer -->
      <div class="code-viewer-section">
        <div class="viewer-header">
          <div class="file-tab">
            <span class="lang-icon">☕</span>
            <span class="filename">{{ nodoActivo().archivo }}</span>
            <span class="layer-tag">{{ nodoActivo().capa }}</span>
          </div>
          <div class="viewer-actions">
            <span class="viewer-hint">Código del proyecto Java Spring Boot</span>
          </div>
        </div>

        <div class="viewer-content">
          <!-- Code Block -->
          <div class="code-column">
            <pre class="code-content"><code>{{ nodoActivo().codigo }}</code></pre>
          </div>

          <!-- Explanation column -->
          <div class="explanation-column">
            <h4 class="exp-title">Explicación Paso a Paso:</h4>
            <ul class="exp-list">
              @for (punto of nodoActivo().explicacion; track punto) {
                <li class="exp-item">{{ punto }}</li>
              }
            </ul>

            <div class="hex-tip">
              <strong>💡 La Magia Hexagonal:</strong>
              Si mañana PizzaByte cambia de correo electrónico a SMS (Twilio) o WhatsApp, 
              el <strong>Dominio</strong> y el <strong>Caso de Uso</strong> no sufren ningún cambio. Solo creas un 
              <code>WhatsAppAdapter implements NotificacionPort</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hex-container {
      max-width: 1140px;
      margin: 0 auto 4rem;
    }

    .hex-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 2.5rem;
    }

    .hex-badge {
      font-size: 0.75rem;
      font-weight: 800;
      color: #ef4444;
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.3);
      padding: 0.35rem 0.95rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .hex-title {
      font-family: 'Playfair Display', serif;
      font-size: 2.35rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .hex-subtitle {
      color: #94a3b8;
      font-size: 1rem;
      line-height: 1.6;
    }

    .diagram-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      align-items: start;
    }

    .diagram-column {
      background: rgba(18, 18, 18, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .core-col {
      background: linear-gradient(180deg, rgba(28, 14, 14, 0.95) 0%, rgba(18, 18, 18, 0.95) 100%);
      border: 1.5px solid rgba(220, 38, 38, 0.4);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(220, 38, 38, 0.12);
    }

    .col-title {
      text-align: center;
      margin-bottom: 0.35rem;
    }

    .col-title h3 {
      font-family: 'Playfair Display', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0.45rem;
      margin-bottom: 0;
    }

    .pill-type {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pill-type.in { 
      background: rgba(255, 255, 255, 0.08); 
      color: #ffffff; 
      border: 1px solid rgba(255, 255, 255, 0.15); 
    }
    .pill-type.core { 
      background: rgba(220, 38, 38, 0.15); 
      color: #ef4444; 
      border: 1px solid rgba(220, 38, 38, 0.35); 
    }
    .pill-type.out { 
      background: rgba(255, 255, 255, 0.08); 
      color: #ffffff; 
      border: 1px solid rgba(255, 255, 255, 0.15); 
    }

    .node-card {
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .node-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
      border-color: rgba(220, 38, 38, 0.4);
      background: #1a1a1a;
    }

    .node-card.active {
      border-color: #dc2626;
      background: rgba(220, 38, 38, 0.12);
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.25), 0 10px 25px rgba(0, 0, 0, 0.8);
    }

    .node-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      background: #0d0d0d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .node-layer {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #ef4444;
      letter-spacing: 0.5px;
    }

    .node-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-desc {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .arrow-out {
      color: #64748b;
      font-size: 1.1rem;
    }

    .node-client-preview {
      background: #0d0d0d;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 0.85rem;
      text-align: center;
    }

    .client-badge {
      font-weight: 700;
      font-size: 0.85rem;
      color: #ffffff;
    }

    .client-detail {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .domain-box {
      background: #0c0c0c;
      border: 1.5px solid rgba(220, 38, 38, 0.35);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
    }

    .domain-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: #ef4444;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.5px;
    }

    .ports-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .port-card {
      padding: 0.65rem;
      background: #141414;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
    }

    .port-card:hover {
      border-color: rgba(220, 38, 38, 0.4);
      background: #1a1a1a;
    }

    .port-card.active {
      border-color: #dc2626;
      background: rgba(220, 38, 38, 0.15);
    }

    .port-card .node-icon {
      font-size: 1.2rem;
      width: 30px;
      height: 30px;
    }

    .highlight-smtp {
      border-color: #dc2626;
      background: rgba(220, 38, 38, 0.08);
    }

    .smtp-tag {
      position: absolute;
      top: -9px;
      right: 10px;
      font-size: 0.65rem;
      background: #dc2626;
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-weight: 700;
    }

    .code-viewer-section {
      background: #0c0c0c;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.85);
    }

    .viewer-header {
      background: #141414;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .file-tab {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .lang-icon {
      font-size: 1.2rem;
    }

    .filename {
      font-family: var(--font-mono);
      font-weight: 700;
      color: #f8fafc;
      font-size: 0.95rem;
    }

    .layer-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(220, 38, 38, 0.15);
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .viewer-hint {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .viewer-content {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
    }

    .code-column {
      padding: 1.5rem;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      background: #080808;
      overflow-x: auto;
    }

    .code-content {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.6;
      color: #cbd5e1;
      white-space: pre;
    }

    .explanation-column {
      background: #0d0d0d;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .exp-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 1rem;
    }

    .exp-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding: 0;
      flex: 1;
    }

    .exp-item {
      font-size: 0.875rem;
      color: #cbd5e1;
      line-height: 1.5;
      position: relative;
      padding-left: 1.25rem;
    }

    .exp-item::before {
      content: "•";
      color: #dc2626;
      font-size: 1.5rem;
      position: absolute;
      left: 0;
      top: -6px;
    }

    .hex-tip {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 12px;
      padding: 1rem;
      font-size: 0.825rem;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .hex-tip strong {
      color: #ffffff;
      display: block;
      margin-bottom: 0.25rem;
    }

    .hex-tip code {
      font-family: var(--font-mono);
      background: rgba(0, 0, 0, 0.3);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      color: #ef4444;
    }

    @media (max-width: 900px) {
      .diagram-grid {
        grid-template-columns: 1fr;
      }
      .viewer-content {
        grid-template-columns: 1fr;
      }
      .code-column {
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
    }
  `]
})
export class HexagonalDiagramComponent {
  readonly nodos: HexNode[] = [
    {
      id: 'adapter-mail',
      nombre: 'MailAdapter.java',
      capa: 'INFRAESTRUCTURA',
      tipo: 'ADAPTADOR_SALIDA',
      archivo: 'MailAdapter.java',
      icono: '✉️',
      codigo: `@Component
public class MailAdapter implements NotificacionPort {

    // Simula JavaMailSender de Spring Boot
    private final JavaMailSender mailSender; 

    public MailAdapter(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void enviarConfirmacion(Pedido pedido) {
        System.out.println("Enviando correo SMTP a: " + pedido.getCorreoCliente());
        System.out.println("Mensaje: Tu pizza de " + pedido.getSaborPizza() + " está en camino.");
        
        // Aquí iría el código real de mailSender.send(mensaje)...
    }
}`,
      explicacion: [
        'Línea 1: @Component registra esta clase en el contenedor de inversión de control de Spring Boot.',
        'Línea 2: ¡La clave! Implementa el NotificacionPort del Dominio, cumpliendo el contrato sin que el Dominio sepa nada de SMTP.',
        'Líneas 10-17: Implementa la lógica de envío del correo con el mensaje "Tu pizza de [sabor] está en camino".',
        'Si PizzaByte decidiera notificar por WhatsApp, solo crearíamos WhatsAppAdapter implements NotificacionPort.'
      ]
    },
    {
      id: 'controller',
      nombre: 'PedidoController.java',
      capa: 'INFRAESTRUCTURA',
      tipo: 'ADAPTADOR_ENTRADA',
      archivo: 'PedidoController.java',
      icono: '🌐',
      codigo: `@RestController
@RequestMapping("/api/pizzas")
public class PedidoController {

    private final CrearPedidoUseCase crearPedidoUseCase;

    public PedidoController(CrearPedidoUseCase crearPedidoUseCase) {
        this.crearPedidoUseCase = crearPedidoUseCase;
    }

    @PostMapping("/ordenar")
    public ResponseEntity<Pedido> ordenarPizza(@RequestBody Pedido pedido) {
        Pedido pedidoCreado = crearPedidoUseCase.ejecutar(pedido);
        return new ResponseEntity<>(pedidoCreado, HttpStatus.CREATED);
    }
}`,
      explicacion: [
        'Líneas 1-2: Expone la API REST que escucha en /api/pizzas/ordenar (consumida por este frontend de Angular).',
        'Línea 5: El controlador NO tiene lógica de negocio. Solo inyecta el caso de uso y le pasa los datos.',
        'Línea 11: @PostMapping recibe el JSON enviado desde el formulario de Angular y lo mapea al objeto Pedido.',
        'Línea 14: Retorna HTTP 201 CREATED con el pedido confirmado.'
      ]
    },
    {
      id: 'usecase',
      nombre: 'CrearPedidoUseCase.java',
      capa: 'APLICACION',
      tipo: 'CASO_DE_USO',
      archivo: 'CrearPedidoUseCase.java',
      icono: '⚙️',
      codigo: `public class CrearPedidoUseCase {
    
    private final PedidoRepositoryPort pedidoRepository;
    private final NotificacionPort notificacionPort;

    public CrearPedidoUseCase(PedidoRepositoryPort pedidoRepository, NotificacionPort notificacionPort) {
        this.pedidoRepository = pedidoRepository;
        this.notificacionPort = notificacionPort;
    }

    public Pedido ejecutar(Pedido pedido) {
        Pedido pedidoGuardado = pedidoRepository.guardar(pedido);
        notificacionPort.enviarConfirmacion(pedidoGuardado);
        return pedidoGuardado;
    }
}`,
      explicacion: [
        'Líneas 3-4: Depende exclusivamente de interfaces (puertos), nunca de implementaciones concretas como JPA o JavaMailSender.',
        'Línea 12: Usa el puerto de repositorio para guardar el pedido en base de datos.',
        'Línea 13: Usa el puerto de notificación para enviar el correo al cliente.',
        'Línea 14: Retorna el pedido con su ID generado.'
      ]
    },
    {
      id: 'entidad',
      nombre: 'Pedido.java',
      capa: 'DOMINIO',
      tipo: 'ENTIDAD',
      archivo: 'Pedido.java',
      icono: '📦',
      codigo: `public class Pedido {
    private Long id;
    private String saborPizza;
    private String correoCliente; // Necesario para saber a quién notificar

    // Getters y setters omitidos para brevedad
}`,
      explicacion: [
        'Representa el concepto puro de negocio de un "Pedido" en PizzaByte.',
        'Java puro (POJO): no hay anotaciones de Spring Boot (@Entity, @Table, etc.) en el núcleo del dominio.',
        'Incluye el correoCliente para habilitar la notificación SMTP.'
      ]
    },
    {
      id: 'port-repo',
      nombre: 'PedidoRepositoryPort.java',
      capa: 'DOMINIO',
      tipo: 'PUERTO',
      archivo: 'PedidoRepositoryPort.java',
      icono: '🔌',
      codigo: `public interface PedidoRepositoryPort {
    Pedido guardar(Pedido pedido);
}`,
      explicacion: [
        'Puerto de salida que declara el contrato para persistencia.',
        'El dominio dicta qué necesita (guardar un Pedido), pero delega el cómo a los adaptadores de infraestructura.'
      ]
    },
    {
      id: 'port-notif',
      nombre: 'NotificacionPort.java',
      capa: 'DOMINIO',
      tipo: 'PUERTO',
      archivo: 'NotificacionPort.java',
      icono: '🔌',
      codigo: `public interface NotificacionPort {
    void enviarConfirmacion(Pedido pedido);
}`,
      explicacion: [
        'Puerto de salida que declara el contrato para notificaciones.',
        'Cualquier adaptador (SMTP, SMS, Push, Slack) puede implementarlo sin tocar el dominio.'
      ]
    },
    {
      id: 'adapter-db',
      nombre: 'PedidoDatabaseAdapter.java',
      capa: 'INFRAESTRUCTURA',
      tipo: 'ADAPTADOR_SALIDA',
      archivo: 'PedidoDatabaseAdapter.java',
      icono: '🗄️',
      codigo: `@Component
public class PedidoDatabaseAdapter implements PedidoRepositoryPort {
    
    private final JpaPedidoRepository jpaRepository; 

    public PedidoDatabaseAdapter(JpaPedidoRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Pedido guardar(Pedido pedido) {
        return jpaRepository.save(pedido); 
    }
}`,
      explicacion: [
        'Implementa el PedidoRepositoryPort usando Spring Data JPA.',
        'Conecta el modelo de dominio con la base de datos relacional SQL.'
      ]
    }
  ];

  readonly nodoActivo = signal<HexNode>(this.nodos[0]); // MailAdapter preseleccionado

  seleccionarNodo(id: string): void {
    const nodo = this.nodos.find(n => n.id === id);
    if (nodo) {
      this.nodoActivo.set(nodo);
    }
  }
}
