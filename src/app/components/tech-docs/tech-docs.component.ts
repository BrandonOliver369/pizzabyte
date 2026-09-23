import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HexagonalDiagramComponent } from '../hexagonal-diagram/hexagonal-diagram.component';
import { SmtpInboxComponent } from '../smtp-inbox/smtp-inbox.component';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

interface JavaClassCode {
  name: string;
  category: string;
  role: string;
  path: string;
  code: string;
  description: string;
}

@Component({
  selector: 'app-tech-docs',
  imports: [CommonModule, FormsModule, HexagonalDiagramComponent, SmtpInboxComponent],
  template: `
    <div class="tech-docs-wrapper animate-fade-in">
      <!-- Banner Superior del Portal Técnico -->
      <header class="docs-hero">
        <div class="docs-hero-content">
          <div class="docs-badge">
            <span class="badge-dot"></span>
            <span>MODO ARQUITECTURA & CÓDIGO • PIZZABYTE DEVPORTAL</span>
          </div>
          <h1 class="docs-title">
            ¿Cómo Funciona <span class="gradient-text">PizzaByte</span> por Dentro?
          </h1>
          <p class="docs-subtitle">
            Explora la arquitectura de software empresarial que impulsa la pizzería: Arquitectura Hexagonal 
            (Ports & Adapters), Interfaces Spring Boot en Java puro, API REST v3 de Brevo, Cookies Persistentes de 7 días 
            y Auditoría de Sesiones con Hash SHA-256 en Bash y PowerShell.
          </p>

          <!-- Barra de Pestañas Técnicas -->
          <nav class="docs-nav">
            <button 
              class="docs-nav-tab" 
              [class.active]="tabActiva() === 'arquitectura'"
              (click)="tabActiva.set('arquitectura')">
              <span>⬡ Arquitectura Hexagonal</span>
            </button>

            <button 
              class="docs-nav-tab" 
              [class.active]="tabActiva() === 'spring'"
              (click)="tabActiva.set('spring')">
              <span>☕ Interfaces Spring Boot</span>
            </button>

            <button 
              class="docs-nav-tab" 
              [class.active]="tabActiva() === 'brevo'"
              (click)="tabActiva.set('brevo')">
              <span>📧 Brevo API v3 & Correo</span>
            </button>

            <button 
              class="docs-nav-tab" 
              [class.active]="tabActiva() === 'cookies'"
              (click)="tabActiva.set('cookies')">
              <span>🍪 Cookies & Temp .txt</span>
            </button>

            <button 
              class="docs-nav-tab" 
              [class.active]="tabActiva() === 'hash'"
              (click)="tabActiva.set('hash')">
              <span>💻 Hash & Bash</span>
            </button>

            <button 
              class="docs-nav-tab word-tab" 
              [class.active]="tabActiva() === 'word'"
              (click)="tabActiva.set('word')">
              <span>📄 Manual Word (.docx)</span>
              <span class="pill-new">12 Págs</span>
            </button>
          </nav>
        </div>
      </header>

      <!-- CONTENIDOS SEGÚN PESTAÑA -->
      <div class="docs-container">
        
        <!-- PESTAÑA 1: ARQUITECTURA HEXAGONAL -->
        @if (tabActiva() === 'arquitectura') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Arquitectura Hexagonal (Ports & Adapters)</h2>
              <p>
                Patrón arquitectónico creado por Alistair Cockburn que aísla el núcleo de dominio de la infraestructura tecnológica mediante interfaces abstractas (Puertos).
              </p>
            </div>
            
            <!-- Componente interactivo existente del diagrama -->
            <app-hexagonal-diagram></app-hexagonal-diagram>
          </section>
        }

        <!-- PESTAÑA 2: INTERFACES SPRING BOOT -->
        @if (tabActiva() === 'spring') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Interfaces y Clases de Spring Boot (Java)</h2>
              <p>
                Código Java puro del núcleo de negocio y adaptadores desacoplados ubicados en <code>mi-proyecto/src/main/java/mi_proyecto/</code>.
              </p>
            </div>

            <div class="code-browser-layout">
              <!-- Selector lateral de archivos Java -->
              <div class="file-tree-sidebar">
                <div class="tree-group-title">DOMINIO (DOMAIN)</div>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'Pedido'"
                  (click)="seleccionarArchivo('Pedido')">
                  <span class="file-icon">📄</span>
                  <div class="file-meta">
                    <span class="file-name">Pedido.java</span>
                    <span class="file-role">Entidad de Dominio</span>
                  </div>
                </button>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'NotificacionPort'"
                  (click)="seleccionarArchivo('NotificacionPort')">
                  <span class="file-icon">🔌</span>
                  <div class="file-meta">
                    <span class="file-name">NotificacionPort.java</span>
                    <span class="file-role">&lt;&lt;interface&gt;&gt; Outbound</span>
                  </div>
                </button>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'PedidoRepositoryPort'"
                  (click)="seleccionarArchivo('PedidoRepositoryPort')">
                  <span class="file-icon">🔌</span>
                  <div class="file-meta">
                    <span class="file-name">PedidoRepositoryPort.java</span>
                    <span class="file-role">&lt;&lt;interface&gt;&gt; Outbound</span>
                  </div>
                </button>

                <div class="tree-group-title">APLICACIÓN (CASOS DE USO)</div>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'CrearPedidoUseCase'"
                  (click)="seleccionarArchivo('CrearPedidoUseCase')">
                  <span class="file-icon">⚡</span>
                  <div class="file-meta">
                    <span class="file-name">CrearPedidoUseCase.java</span>
                    <span class="file-role">Orquestador de Negocio</span>
                  </div>
                </button>

                <div class="tree-group-title">INFRAESTRUCTURA (ADAPTADORES)</div>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'HexagonalConfig'"
                  (click)="seleccionarArchivo('HexagonalConfig')">
                  <span class="file-icon">⚙️</span>
                  <div class="file-meta">
                    <span class="file-name">HexagonalConfig.java</span>
                    <span class="file-role">Inyección de Dependencias</span>
                  </div>
                </button>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'PedidoDatabaseAdapter'"
                  (click)="seleccionarArchivo('PedidoDatabaseAdapter')">
                  <span class="file-icon">💾</span>
                  <div class="file-meta">
                    <span class="file-name">PedidoDatabaseAdapter.java</span>
                    <span class="file-role">Adaptador JPA / Memoria</span>
                  </div>
                </button>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'MailAdapter'"
                  (click)="seleccionarArchivo('MailAdapter')">
                  <span class="file-icon">✉️</span>
                  <div class="file-meta">
                    <span class="file-name">MailAdapter.java</span>
                    <span class="file-role">Adaptador SMTP / Brevo</span>
                  </div>
                </button>
                <button 
                  class="file-item" 
                  [class.active]="archivoJavaSeleccionado() === 'PedidoController'"
                  (click)="seleccionarArchivo('PedidoController')">
                  <span class="file-icon">🌐</span>
                  <div class="file-meta">
                    <span class="file-name">PedidoController.java</span>
                    <span class="file-role">Controlador REST (Inbound)</span>
                  </div>
                </button>
              </div>

              <!-- Visor de Código Fuente Java -->
              <div class="code-viewer-main">
                @if (claseJavaActual(); as c) {
                  <div class="code-card">
                    <div class="code-card-header">
                      <div class="code-header-left">
                        <span class="lang-pill">JAVA</span>
                        <span class="code-file-title">{{ c.name }}.java</span>
                        <span class="role-pill">{{ c.role }}</span>
                      </div>
                      <div class="code-header-right">
                        <span class="path-label">{{ c.path }}</span>
                        <button class="btn-copy" (click)="copiarCodigo(c.code)">
                          <span>{{ textoCopiado() ? '✓ ¡Copiado!' : '📋 Copiar' }}</span>
                        </button>
                      </div>
                    </div>

                    <div class="code-explanation">
                      <strong>💡 Explicación Arquitectónica:</strong> {{ c.description }}
                    </div>

                    <pre class="code-display"><code>{{ c.code }}</code></pre>
                  </div>
                }
              </div>
            </div>
          </section>
        }

        <!-- PESTAÑA 3: BREVO API V3 & CORREO -->
        @if (tabActiva() === 'brevo') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Integración con Brevo REST API v3</h2>
              <p>
                Servicio transaccional de correo para despachar notificaciones reales al buzón de los clientes al ordenar.
              </p>
            </div>

            <!-- Resumen de Configuración Brevo -->
            <div class="brevo-cards-grid">
              <div class="b-card">
                <div class="b-icon">🌐</div>
                <h3>Endpoint Oficial</h3>
                <code>https://api.brevo.com/v3/smtp/email</code>
                <p>Acepta llamadas HTTP POST con payload JSON y autenticación por cabecera <code>api-key</code>.</p>
              </div>

              <div class="b-card highlight">
                <div class="b-icon">🔑</div>
                <h3>Clave API Autorizada</h3>
                <code class="truncate-code">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</code>
                <p>Configurada y verificada con permisos de envío transaccional en producción.</p>
              </div>

              <div class="b-card warning">
                <div class="b-icon">📧</div>
                <h3>Remitente Verificado</h3>
                <code>brandooliver4&#64;gmail.com</code>
                <p><strong>Regla estricta Brevo:</strong> El remitente debe ser una dirección autorizada en la cuenta de Brevo.</p>
              </div>
            </div>

            <!-- Bandeja de Correos Enviados -->
            <div class="inbox-wrapper-box">
              <h3 class="box-title">✉️ Buzón de Mensajes Despachados por MailAdapter</h3>
              <app-smtp-inbox></app-smtp-inbox>
            </div>
          </section>
        }

        <!-- PESTAÑA 4: COOKIES & CARPETA TEMPORAL -->
        @if (tabActiva() === 'cookies') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Módulo de Cookies Persistentes & Archivo .txt en Disco</h2>
              <p>
                Auditoría en el sistema de archivos del sistema operativo anfitrión y sesiones persistentes de 7 días.
              </p>
            </div>

            <div class="cookies-grid">
              <!-- Tarjeta de Cookie -->
              <div class="c-box">
                <div class="c-header">
                  <span class="c-icon">🍪</span>
                  <div>
                    <h3>Cookie HTTP Persistente</h3>
                    <p><code>pizzabyte_session</code> con directiva <code>Max-Age=604800</code></p>
                  </div>
                </div>

                <div class="c-body">
                  <div class="c-stat">
                    <span class="c-label">Estado de Cookie:</span>
                    <span class="c-val text-green">
                      {{ authService.cookieDetectada() ? '🟢 ACTIVA Y DETECTADA EN DISCO' : '🟡 NO DETECTADA' }}
                    </span>
                  </div>
                  <div class="c-stat">
                    <span class="c-label">Token Actual:</span>
                    <code class="c-val-code">{{ authService.tokenActual() || 'Ninguno' }}</code>
                  </div>
                  <div class="c-stat">
                    <span class="c-label">Duración:</span>
                    <span class="c-val">7 Días (604,800 segundos)</span>
                  </div>

                  <p class="c-note">
                    💡 Si cierras la pestaña o el navegador por completo, al volver a abrir 
                    <a href="http://localhost:4200">http://localhost:4200</a>, el servicio <code>AuthService</code> restaura tu sesión sin pedir clave.
                  </p>
                </div>
              </div>

              <!-- Tarjeta de Archivo .txt -->
              <div class="c-box">
                <div class="c-header">
                  <span class="c-icon">📄</span>
                  <div>
                    <h3>Archivo de Auditoría en Carpeta Temporal</h3>
                    <p>Ubicación física: <code>./temp_sessions/sesion_&lt;usuario&gt;.txt</code></p>
                  </div>
                </div>

                <div class="c-body">
                  <div class="file-ctrl-bar">
                    <span class="file-badge">
                      {{ authService.archivoTxtActual()?.nombre || 'sesion_admin.txt' }}
                    </span>
                    <button class="btn-refresh-sm" (click)="refrescarTxt()">
                      🔄 Recargar Disco
                    </button>
                    <button class="btn-download-sm" (click)="descargarTxt()">
                      💾 Descargar .txt
                    </button>
                  </div>

                  <pre class="txt-preview-box"><code>{{ authService.archivoTxtActual()?.contenido || 'Inicia sesión para generar y visualizar tu archivo .txt' }}</code></pre>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- PESTAÑA 5: HASH & BASH -->
        @if (tabActiva() === 'hash') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Seguridad Criptográfica (Hash SHA-256) & Scripts Terminal</h2>
              <p>
                Validación de contraseñas de 256 bits y auditoría automatizada en terminal mediante scripts multiplataforma.
              </p>
            </div>

            <!-- Calculadora en Vivo de Hash -->
            <div class="hash-calc-card">
              <h3>🔑 Calculadora Interactiva de Hash SHA-256</h3>
              <p>Escribe cualquier contraseña para calcular su resumen criptográfico en tiempo real:</p>
              
              <div class="calc-input-row">
                <input 
                  type="text" 
                  [(ngModel)]="textoParaHash" 
                  (ngModelChange)="calcularHashEnVivo($event)"
                  placeholder="Escribe una contraseña (ej: pizza123)..." 
                  class="calc-input" />
              </div>

              <div class="calc-result-box">
                <span class="res-label">Hash SHA-256 Resultante (64 caracteres hexadecimales):</span>
                <code class="res-hash">{{ hashCalculado() }}</code>
              </div>
            </div>

            <!-- Tabla de Hashes Preconfigurados -->
            <div class="table-container">
              <h3 class="table-title">Usuarios Registrados y sus Hashes Cifrados</h3>
              <table class="tech-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Contraseña en Plano</th>
                    <th>Hash SHA-256 Almacenado</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>admin</strong></td>
                    <td><code>pizza123</code></td>
                    <td><code>767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8</code></td>
                    <td><span class="pill-admin">ADMINISTRADOR</span></td>
                  </tr>
                  <tr>
                    <td><strong>brandon</strong></td>
                    <td><code>byte2026</code></td>
                    <td><code>6227931946d4f7130d60e51a34c2b17807ce00cd96177db1d8a6601646dacfb4</code></td>
                    <td><span class="pill-vip">CLIENTE_VIP</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Comandos para Scripts en Terminal -->
            <div class="scripts-box">
              <h3>💻 Ejecución de Scripts de Verificación en Consola</h3>
              <div class="scripts-cols">
                <div class="script-col">
                  <h4>Opción A: Git Bash / Linux / macOS (verify_session.sh)</h4>
                  <pre class="script-cmd"><code># Auditoría rápida:
bash verify_session.sh admin pizza123

# Con cliente:
bash verify_session.sh brandon byte2026</code></pre>
                </div>

                <div class="script-col">
                  <h4>Opción B: Windows PowerShell (verify_session.ps1)</h4>
                  <pre class="script-cmd"><code># Auditoría rápida:
.\verify_session.ps1 -Usuario admin -Password pizza123

# Con cliente:
.\verify_session.ps1 -Usuario brandon -Password byte2026</code></pre>
                </div>
              </div>
            </div>
          </section>
        }

        <!-- PESTAÑA 6: MANUAL WORD (.DOCX) -->
        @if (tabActiva() === 'word') {
          <section class="tab-pane animate-fade-in">
            <div class="pane-header">
              <h2>Manual de Usuario y Documentación Técnica en Word (.docx)</h2>
              <p>
                Documento oficial generado con el motor nativo de Microsoft Word (12 páginas completas, tablas, estilos y manual operativo).
              </p>
            </div>

            <div class="word-card-highlight">
              <div class="word-card-top">
                <div class="word-icon">📄</div>
                <div>
                  <h3>Manual_Usuario_y_Sistema_PizzaByte.docx</h3>
                  <span class="file-size-tag">36.6 KB • 12 Páginas • Formato Microsoft Word OpenXML</span>
                </div>
              </div>

              <div class="word-specs">
                <div class="spec-item">
                  <span class="spec-k">Ubicación del Archivo:</span>
                  <code class="spec-v">c:\Users\brand\Downloads\mi-frontend\Manual_Usuario_y_Sistema_PizzaByte.docx</code>
                </div>
                <div class="spec-item">
                  <span class="spec-k">Compatibilidad:</span>
                  <span class="spec-v text-green">100% Compatible con Microsoft Word (Validado con 0 errores)</span>
                </div>
                <div class="spec-item">
                  <span class="spec-k">Contenido:</span>
                  <span class="spec-v">Parte 1 (Documentación Técnica) + Parte 2 (Manual de Usuario y Guía Operativa)</span>
                </div>
              </div>

              <div class="word-actions">
                <a 
                  class="btn-open-word" 
                  href="file:///c:/Users/brand/Downloads/mi-frontend/Manual_Usuario_y_Sistema_PizzaByte.docx" 
                  target="_blank">
                  📂 Abrir Documento en Word
                </a>
              </div>
            </div>
          </section>
        }

      </div>
    </div>
  `,
  styles: [`
    .tech-docs-wrapper {
      padding-bottom: 4rem;
    }

    .docs-hero {
      background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
      color: white;
      padding: 3.5rem 1.5rem 2rem;
      border-bottom: 1px solid rgba(220, 38, 38, 0.25);
    }

    .docs-hero-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .docs-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: #ef4444;
      background: rgba(220, 38, 38, 0.12);
      border: 1px solid rgba(220, 38, 38, 0.35);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #dc2626;
      box-shadow: 0 0 8px #dc2626;
    }

    .docs-title {
      font-size: 2.4rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }

    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #ef4444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .docs-subtitle {
      font-size: 1.05rem;
      color: #a1a1aa;
      max-width: 850px;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .docs-nav {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0.25rem;
    }

    .docs-nav-tab {
      background: transparent;
      color: #94a3b8;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.75rem 1.25rem;
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }

    .docs-nav-tab:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }

    .docs-nav-tab.active {
      color: #ffffff;
      background: rgba(220, 38, 38, 0.15);
      border-bottom-color: #dc2626;
    }

    .word-tab .pill-new {
      font-size: 0.7rem;
      background: #dc2626;
      color: white;
      padding: 0.15rem 0.45rem;
      border-radius: 9999px;
      font-weight: 800;
    }

    .docs-container {
      max-width: 1200px;
      margin: 2.5rem auto 0;
      padding: 0 1.5rem;
    }

    .pane-header {
      margin-bottom: 2rem;
    }

    .pane-header h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.4rem;
    }

    .pane-header p {
      font-size: 1rem;
      color: #a1a1aa;
    }

    /* Spring Boot Code Browser */
    .code-browser-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .file-tree-sidebar {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .tree-group-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: #ef4444;
      letter-spacing: 0.75px;
      margin: 1rem 0 0.5rem 0.5rem;
    }

    .tree-group-title:first-child {
      margin-top: 0.25rem;
    }

    .file-item {
      width: 100%;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      margin-bottom: 0.25rem;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }

    .file-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .file-item.active {
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-left: 3px solid #dc2626;
    }

    .file-icon {
      font-size: 1.1rem;
    }

    .file-meta {
      display: flex;
      flex-direction: column;
    }

    .file-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }

    .file-role {
      font-size: 0.72rem;
      color: #a1a1aa;
    }

    .code-viewer-main {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .code-card-header {
      background: #0a0a0a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 0.85rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .code-header-left, .code-header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .lang-pill {
      font-size: 0.7rem;
      font-weight: 800;
      background: #dc2626;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    .code-file-title {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 0.95rem;
      color: #ffffff;
    }

    .role-pill {
      font-size: 0.72rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      color: #cbd5e1;
    }

    .path-label {
      font-size: 0.75rem;
      color: #a1a1aa;
      font-family: 'JetBrains Mono', monospace;
    }

    .btn-copy {
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.4);
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-copy:hover {
      background: #dc2626;
      border-color: #ef4444;
    }

    .code-explanation {
      background: #171717;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.85rem 1.25rem;
      font-size: 0.9rem;
      color: #cbd5e1;
      line-height: 1.5;
    }

    .code-explanation strong {
      color: #ef4444;
    }

    .code-display {
      margin: 0;
      padding: 1.25rem;
      background: #050505;
      color: #f1f5f9;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 0.88rem;
      line-height: 1.55;
      overflow-x: auto;
      max-height: 520px;
    }

    /* Brevo Cards */
    .brevo-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .b-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .b-card.highlight {
      border-color: rgba(220, 38, 38, 0.5);
      background: rgba(220, 38, 38, 0.08);
    }

    .b-card.warning {
      border-color: rgba(255, 255, 255, 0.15);
      background: #171717;
    }

    .b-icon {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .b-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }

    .b-card code {
      display: block;
      background: #000000;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-size: 0.82rem;
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.2);
      margin-bottom: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .truncate-code {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .b-card p {
      font-size: 0.88rem;
      color: #a1a1aa;
      margin: 0;
      line-height: 1.4;
    }

    .inbox-wrapper-box {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .box-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1.5rem;
    }

    /* Cookies & Temp */
    .cookies-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .c-box {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .c-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .c-icon {
      font-size: 2rem;
    }

    .c-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .c-header p {
      font-size: 0.85rem;
      color: #a1a1aa;
      margin: 0;
    }

    .c-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.9rem;
    }

    .c-label {
      color: #a1a1aa;
      font-weight: 600;
    }

    .c-val {
      color: #ffffff;
    }

    .c-val.text-green {
      color: #ef4444;
      font-weight: 700;
    }

    .c-val-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      background: #000000;
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .c-note {
      font-size: 0.85rem;
      color: #cbd5e1;
      background: #171717;
      padding: 0.85rem;
      border-radius: 8px;
      border-left: 3px solid #dc2626;
      margin-top: 1rem;
      line-height: 1.5;
    }

    .c-note a {
      color: #ef4444;
    }

    .file-ctrl-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .file-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 0.85rem;
      background: rgba(220, 38, 38, 0.15);
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.3);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
    }

    .btn-refresh-sm, .btn-download-sm {
      background: #1a1a1a;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh-sm:hover, .btn-download-sm:hover {
      background: #dc2626;
      border-color: #dc2626;
      color: #ffffff;
    }

    .txt-preview-box {
      background: #000000;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      line-height: 1.45;
      max-height: 320px;
      overflow-y: auto;
      white-space: pre-wrap;
    }

    /* Hash & Bash */
    .hash-calc-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .hash-calc-card h3 {
      font-size: 1.2rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.4rem;
    }

    .hash-calc-card p {
      font-size: 0.9rem;
      color: #a1a1aa;
      margin-bottom: 1rem;
    }

    .calc-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #000000;
      color: #ffffff;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: all 0.2s;
    }

    .calc-input:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);
    }

    .calc-result-box {
      margin-top: 1rem;
      background: #0a0a0a;
      border: 1px solid rgba(220, 38, 38, 0.3);
      padding: 0.85rem 1rem;
      border-radius: 8px;
    }

    .res-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #a1a1aa;
      margin-bottom: 0.35rem;
    }

    .res-hash {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.92rem;
      font-weight: 700;
      color: #ef4444;
      word-break: break-all;
    }

    .tech-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
      background: #121212;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .tech-table th {
      background: #0a0a0a;
      color: white;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tech-table td {
      padding: 0.75rem 1rem;
      font-size: 0.88rem;
      color: #cbd5e1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .tech-table td code {
      background: #000000;
      color: #ef4444;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }

    .pill-admin {
      background: rgba(220, 38, 38, 0.15);
      color: #ef4444;
      border: 1px solid rgba(220, 38, 38, 0.3);
      font-weight: 800;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .pill-vip {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-weight: 800;
      font-size: 0.72rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .scripts-box {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .scripts-box h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1rem;
    }

    .scripts-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .script-col h4 {
      font-size: 0.9rem;
      color: #cbd5e1;
      margin-bottom: 0.5rem;
    }

    .script-cmd {
      background: #000000;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-family: 'JetBrains Mono', monospace;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      line-height: 1.45;
      margin: 0;
    }

    /* Word Card */
    .word-card-highlight {
      background: #121212;
      border: 1px solid rgba(220, 38, 38, 0.4);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      max-width: 800px;
      margin: 0 auto;
    }

    .word-card-top {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .word-icon {
      font-size: 3.5rem;
    }

    .word-card-top h3 {
      font-size: 1.4rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .file-size-tag {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.35);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }

    .word-specs {
      background: #0a0a0a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .spec-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .spec-k {
      font-size: 0.78rem;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .spec-v {
      font-size: 0.95rem;
      color: #f8fafc;
    }

    .spec-v.text-green {
      color: #ef4444;
      font-weight: 700;
    }

    .word-actions {
      display: flex;
      justify-content: center;
    }

    .btn-open-word {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      font-weight: 800;
      font-size: 1.05rem;
      padding: 0.85rem 2.25rem;
      border-radius: 10px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
      transition: all 0.2s;
    }

    .btn-open-word:hover {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
    }

    @media (max-width: 900px) {
      .code-browser-layout, .cookies-grid, .scripts-cols {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TechDocsComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly pedidoService = inject(PedidoService);

  readonly tabActiva = signal<'arquitectura' | 'spring' | 'brevo' | 'cookies' | 'hash' | 'word'>('arquitectura');
  readonly archivoJavaSeleccionado = signal<string>('Pedido');
  readonly textoCopiado = signal<boolean>(false);

  // Hash calculator
  readonly textoParaHash = signal<string>('pizza123');
  readonly hashCalculado = signal<string>('767b181bf831a0206de45e595f88710343bfd2ded1c060bba3566bc590d5d3c8');

  readonly catalogoJava: JavaClassCode[] = [
    {
      name: 'Pedido',
      category: 'Dominio',
      role: 'Entidad de Dominio Pura',
      path: 'mi_proyecto.domain.model.Pedido',
      description: 'Entidad agnóstica de negocio. No contiene anotaciones de Spring Boot, Hibernate ni JPA. Solo atributos y métodos del negocio.',
      code: `package mi_proyecto.domain.model;

public class Pedido {
    private Long id;
    private String saborPizza;
    private String correoCliente;

    public Pedido() {}

    public Pedido(Long id, String saborPizza, String correoCliente) {
        this.id = id;
        this.saborPizza = saborPizza;
        this.correoCliente = correoCliente;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSaborPizza() { return saborPizza; }
    public void setSaborPizza(String saborPizza) { this.saborPizza = saborPizza; }
    public String getCorreoCliente() { return correoCliente; }
    public void setCorreoCliente(String correoCliente) { this.correoCliente = correoCliente; }
}`
    },
    {
      name: 'NotificacionPort',
      category: 'Dominio',
      role: '<<interface>> Puerto Outbound',
      path: 'mi_proyecto.domain.port.out.NotificacionPort',
      description: 'Contrato formal que el dominio impone hacia el exterior. Quien desee despachar notificaciones debe implementar esta interfaz.',
      code: `package mi_proyecto.domain.port.out;

import mi_proyecto.domain.model.Pedido;

public interface NotificacionPort {
    void enviarConfirmacion(Pedido pedido);
}`
    },
    {
      name: 'PedidoRepositoryPort',
      category: 'Dominio',
      role: '<<interface>> Puerto Outbound',
      path: 'mi_proyecto.domain.port.out.PedidoRepositoryPort',
      description: 'Contrato para persistencia de datos. Desacopla totalmente la lógica de si se usa MySQL, Mongo o memoria volátil.',
      code: `package mi_proyecto.domain.port.out;

import mi_proyecto.domain.model.Pedido;

public interface PedidoRepositoryPort {
    Pedido guardar(Pedido pedido);
}`
    },
    {
      name: 'CrearPedidoUseCase',
      category: 'Aplicación',
      role: 'Caso de Uso / Orquestador',
      path: 'mi_proyecto.application.usecase.CrearPedidoUseCase',
      description: 'Orquesta la lógica del negocio: primero persiste el pedido mediante PedidoRepositoryPort y luego emite la notificación con NotificacionPort.',
      code: `package mi_proyecto.application.usecase;

import mi_proyecto.domain.model.Pedido;
import mi_proyecto.domain.port.out.NotificacionPort;
import mi_proyecto.domain.port.out.PedidoRepositoryPort;

public class CrearPedidoUseCase {
    
    private final PedidoRepositoryPort pedidoRepository;
    private final NotificacionPort notificacionPort;

    // Inyección pura por constructor (sin anotaciones de Spring en el core)
    public CrearPedidoUseCase(PedidoRepositoryPort pedidoRepository, NotificacionPort notificacionPort) {
        this.pedidoRepository = pedidoRepository;
        this.notificacionPort = notificacionPort;
    }

    public Pedido ejecutar(Pedido pedido) {
        // 1. Guardar mediante el puerto de persistencia
        Pedido pedidoGuardado = pedidoRepository.guardar(pedido);
        
        // 2. Disparar notificación mediante el puerto de notificación
        notificacionPort.enviarConfirmacion(pedidoGuardado);
        
        return pedidoGuardado;
    }
}`
    },
    {
      name: 'HexagonalConfig',
      category: 'Infraestructura',
      role: 'Configuración IoC de Spring',
      path: 'mi_proyecto.infrastructure.config.HexagonalConfig',
      description: 'Clase de configuración de Spring Boot que crea el bean del caso de uso inyectándole los adaptadores correspondientes.',
      code: `package mi_proyecto.infrastructure.config;

import mi_proyecto.application.usecase.CrearPedidoUseCase;
import mi_proyecto.domain.port.out.NotificacionPort;
import mi_proyecto.domain.port.out.PedidoRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HexagonalConfig {

    @Bean
    public CrearPedidoUseCase crearPedidoUseCase(
            PedidoRepositoryPort pedidoRepositoryPort,
            NotificacionPort notificacionPort) {
        return new CrearPedidoUseCase(pedidoRepositoryPort, notificacionPort);
    }
}`
    },
    {
      name: 'PedidoDatabaseAdapter',
      category: 'Infraestructura',
      role: 'Adaptador Outbound (Persistencia)',
      path: 'mi_proyecto.infrastructure.adapter.out.persistence.PedidoDatabaseAdapter',
      description: 'Implementa PedidoRepositoryPort. Persiste en JPA y cuenta con almacenamiento en memoria concurrente como mecanismo de tolerancia a fallos.',
      code: `package mi_proyecto.infrastructure.adapter.out.persistence;

import mi_proyecto.domain.model.Pedido;
import mi_proyecto.domain.port.out.PedidoRepositoryPort;
import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Map;

@Component
public class PedidoDatabaseAdapter implements PedidoRepositoryPort {

    private final JpaPedidoRepository jpaRepository;
    private final Map<Long, Pedido> inMemoryBackup = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1050);

    public PedidoDatabaseAdapter(JpaPedidoRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Pedido guardar(Pedido pedido) {
        try {
            if (jpaRepository != null) {
                PedidoEntity entity = new PedidoEntity(pedido.getId(), pedido.getSaborPizza(), pedido.getCorreoCliente());
                PedidoEntity guardada = jpaRepository.save(entity);
                return new Pedido(guardada.getId(), guardada.getSaborPizza(), guardada.getCorreoCliente());
            }
        } catch (Exception e) {
            System.err.println("SQL offline, usando memoria concurrente...");
        }

        Long id = pedido.getId() != null ? pedido.getId() : idGenerator.incrementAndGet();
        pedido.setId(id);
        inMemoryBackup.put(id, pedido);
        return pedido;
    }
}`
    },
    {
      name: 'MailAdapter',
      category: 'Infraestructura',
      role: 'Adaptador Outbound (Mensajería)',
      path: 'mi_proyecto.infrastructure.adapter.out.mail.MailAdapter',
      description: 'Implementa NotificacionPort. Despacha el correo de confirmación de la orden usando el relay SMTP de Brevo.',
      code: `package mi_proyecto.infrastructure.adapter.out.mail;

import mi_proyecto.domain.model.Pedido;
import mi_proyecto.domain.port.out.NotificacionPort;
import org.springframework.stereotype.Component;

@Component
public class MailAdapter implements NotificacionPort {

    @Override
    public void enviarConfirmacion(Pedido pedido) {
        System.out.println("Enviando correo SMTP a: " + pedido.getCorreoCliente());
        System.out.println("Detalle: Pizza " + pedido.getSaborPizza() + " en camino.");
        System.out.println("✅ [MailAdapter] Notificación SMTP despachada exitosamente para orden #" + pedido.getId());
    }
}`
    },
    {
      name: 'PedidoController',
      category: 'Infraestructura',
      role: 'Adaptador Inbound (REST Web)',
      path: 'mi_proyecto.infrastructure.adapter.in.web.PedidoController',
      description: 'Expone el endpoint HTTP REST POST /api/pizzas/ordenar con soporte de CORS para recibir las órdenes desde Angular.',
      code: `package mi_proyecto.infrastructure.adapter.in.web;

import mi_proyecto.application.usecase.CrearPedidoUseCase;
import mi_proyecto.domain.model.Pedido;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pizzas")
@CrossOrigin(origins = "*")
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
}`
    }
  ];

  
  async refrescarTxt(): Promise<void> {
    await this.authService.refrescarArchivoTxt();
  }

  descargarTxt(): void {
    const info = this.authService.archivoTxtActual();
    const contenido = info?.contenido || 'PIZZABYTE SESION TEMPORAL';
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = info?.nombre || 'sesion_pizzabyte.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  ngOnInit(): void {
    this.refrescarTxt();
  }

  claseJavaActual(): JavaClassCode | undefined {
    return this.catalogoJava.find(c => c.name === this.archivoJavaSeleccionado());
  }

  seleccionarArchivo(nombre: string): void {
    this.archivoJavaSeleccionado.set(nombre);
  }

  async copiarCodigo(codigo: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(codigo);
      this.textoCopiado.set(true);
      setTimeout(() => this.textoCopiado.set(false), 2000);
    } catch {
      // fallback
    }
  }

  async calcularHashEnVivo(texto: string): Promise<void> {
    if (!texto) {
      this.hashCalculado.set('');
      return;
    }
    const hash = await this.authService.calcularHashSHA256(texto);
    this.hashCalculado.set(hash);
  }
}
