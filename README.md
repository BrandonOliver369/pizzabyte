# 🍕 PizzaByte — E-Commerce Gastronómico & KDS de Nueva Generación

[![Angular](https://img.shields.io/badge/Angular-21.2.23-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Gateway_REST-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-Hexagonal_Arch-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PayPal SDK](https://img.shields.io/badge/PayPal_SDK-v5_Smart_Buttons-003087?style=for-the-badge&logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![Brevo API](https://img.shields.io/badge/Brevo_API-v3_Transactional-0B99FF?style=for-the-badge&logo=brevo&logoColor=white)](https://www.brevo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Responsive-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**PizzaByte** es una plataforma integral de comercio electrónico para el sector culinario y gastronómico, diseñada bajo los principios estrictos de **Arquitectura Hexagonal (Ports & Adapters)**. Ofrece una experiencia de usuario cinematográfica mediante **Scrollytelling 3D Apple-Style**, autenticación omnicanal (Google, Meta/Facebook y Hash SHA-256), cobros capturados con **PayPal JavaScript SDK v5**, notificaciones transaccionales automáticas vía **Brevo API v3** y un **Kitchen Display System (KDS)** discreto para operaciones de cocina.

---

## 🌟 Características Principales

* 🎨 **Scrollytelling 3D Inmersivo (Apple-Style):** Física de desplazamiento no lineal que traslada la pizza desde el centro hacia el margen izquierdo a 60 FPS sin colisiones de interfaz.
* 🏛️ **Arquitectura Hexagonal Pura:** Desacoplamiento total del dominio de negocio (Spring Boot / Java) de los adaptadores de infraestructura (servidores HTTP, mensajería y pasarelas de pago).
* 💳 **Pasarela de Pagos Oficial PayPal SDK v5:** Botones inteligentes (*Smart Payment Buttons*) con captura real de fondos en sandbox y validación de seguridad cruzada en el backend (`POST /api/payments/paypal/verify`).
* 🔐 **Autenticación Híbrida y Persistencia:**
  * Google Identity Services (OAuth 2.0).
  * Meta/Facebook SDK (`FB.login`).
  * Autenticación tradicional con contraseña encriptada en **Hash SHA-256**.
  * Cookies de sesión persistentes de 7 días (`Max-Age=604800`, `SameSite=Lax`).
  * Archivos de auditoría de sesión generados en servidor (`temp_sessions/sesion_<usuario>.txt`).
* 🍳 **Kitchen Display System (KDS Segregado):**
  * Acceso administrativo oculto mediante `#admin` o `?admin=true`.
  * Tablero Kanban de 4 carriles: *Pendiente ➔ En Horno ➔ En Reparto ➔ Entregado*.
  * Registro de comandas multicanal (Web, Mostrador y Teléfono).
  * Distintivo visual especial para órdenes pagadas con PayPal.
* 📧 **Confirmación Transaccional Real (Brevo API v3):** Notificaciones por correo electrónico enviadas automáticamente en tiempo real al cliente con el desglose del pedido.
* 📱 **Diseño 100% Responsivo:** Adaptabilidad fluida para pantallas ultra-wide, tablets (`<= 1120px`) y smartphones (`< 480px`).

---

## 🏗️ Arquitectura del Sistema (Puertos y Adaptadores)

```
                       ┌────────────────────────────────────────────────────────┐
                       │                   CLIENTE / BROWSER                    │
                       │   Angular 21 (Signals + Standalone + Tailwind CSS)     │
                       └───────────────────────────┬────────────────────────────┘
                                                   │ HTTP / REST
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CAPA DE ADAPTADORES                                      │
│                                                                                                │
│   [Adaptador Inbound]                     [Adaptadores Outbound]                               │
│    • PedidoController (REST API)           • MailAdapter (Brevo API v3)                        │
│    • Node.js Gateway (server.js :8080)     • PayPalAdapter (PayPal REST API v2 / SDK v5)       │
│                                            • PedidoDatabaseAdapter (Persistencia)              │
│                                            • AuthAdapter (Google OAuth / FB SDK / SHA-256)     │
└──────────────────────────────────────┬─────────────────────────▲───────────────────────────────┘
                                       │                         │
                               [Puerto Inbound]           [Puertos Outbound]
                                       │                         │
┌──────────────────────────────────────▼─────────────────────────┴───────────────────────────────┐
│                                   CAPA DE DOMINIO Y APLICACIÓN                                 │
│                                                                                                │
│   • CrearPedidoUseCase (Lógica Nuclear de Negocio)                                             │
│   • NotificacionPort & PedidoRepositoryPort (Interfaces de Contrato)                           │
│   • Pedido.java (Entidad Pura de Dominio)                                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Requisitos Previos y Ejecución Local

### Prerrequisitos
* [Node.js](https://nodejs.org/) v18 o superior
* [Angular CLI](https://angular.dev/) v21 (`npm install -g @angular/cli`)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/BrandonOliver369/pizzabyte.git
cd pizzabyte
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar el Servidor Backend (Gateway REST :8080)
En una terminal:
```bash
node server.js
```
*El servidor iniciará en `http://localhost:8080`.*

### 4. Iniciar el Frontend (Angular :4200)
En otra terminal:
```bash
ng serve
```
*Abre tu navegador en `http://localhost:4200`.*

---

## 🔑 Credenciales de Prueba y Accesos

| Módulo / Función | Ruta de Acceso | Usuario / Credencial | Rol / Descripción |
| :--- | :--- | :--- | :--- |
| **Tienda y Checkout** | `http://localhost:4200` | Libre / Creación de Cuenta | Cliente / Comprador |
| **Consola KDS Cocina** | `http://localhost:4200/#admin` | `#admin` en la barra de URL | Staff de Cocina / Supervisor |
| **Admin Tradicional** | Formulario de Login | Usuario: `admin`<br>Contraseña: `pizza123` | Administrador Maestro |
| **Cliente VIP Demo** | Formulario de Login | Usuario: `brandon`<br>Contraseña: `byte2026` | Cliente Frecuente |

---

## 🧪 Scripts de Auditoría de Sesión por Terminal

El sistema incluye scripts automatizados para verificar el estado de persistencia y hashes SHA-256 sin necesidad de abrir el navegador:

* **En PowerShell (Windows):**
  ```powershell
  .\verify_session.ps1 -Usuario admin -Password pizza123
  ```
* **En Bash (Linux / macOS / Git Bash):**
  ```bash
  bash verify_session.sh admin pizza123
  ```

---

## 📄 Documentación Técnica Completa

El repositorio incluye el manual integral en formato Microsoft Word:
* 📘 `Manual_Usuario_y_Sistema_PizzaByte.docx` (Documentación técnica y manual operativo paso a paso).

---

## 👨‍💻 Autor

Desarrollado con dedicación por **Brandon Oliver** ([@BrandonOliver369](https://github.com/BrandonOliver369)).
Licenciado para fines académicos, demostrativos y de desarrollo comercial.
