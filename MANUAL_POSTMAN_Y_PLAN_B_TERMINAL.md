# 📘 MANUAL DE EVALUACIÓN: DOMINIO LOCAL, CONTROLADORES CRUD, DERECHOS ARCO Y PLAN B EN TERMINAL

**Proyecto:** PizzaByte - Plataforma de Pizzería Gourmet  
**Stack Backend:** Java 21 / 25, Spring Boot 3.3.5, Spring Data JPA, PostgreSQL 18  
**Fecha:** Octubre 2026  

---

## 📑 ÍNDICE
1. [Punto 1: Levantamiento de Dominio en Red Local](#1-punto-1-levantamiento-de-dominio-en-red-local)
2. [Punto 2: Mínimo 5 Controladores CRUD Funcionando](#2-punto-2-mínimo-5-controladores-crud-funcionando)
3. [Punto 3: Implementación y Funcionamiento de los Derechos ARCO](#3-punto-3-implementación-y-funcionamiento-de-los-derechos-arco)
4. [Punto 4: Manual de Uso con Postman](#4-punto-4-manual-de-uso-con-postman)
5. [Punto 5: PLAN B CON LA TERMINAL (CURL y PowerShell)](#5-punto-5-plan-b-con-la-terminal-curl-y-powershell)

---

## 1. PUNTO 1: LEVANTAMIENTO DE DOMINIO EN RED LOCAL

El objetivo es sustituir la dirección genérica `http://localhost:8080` o la IP física `http://192.168.X.X:8080` por un nombre de dominio amigable y profesional (`http://api.pizzabyte.local:8080` o `http://pizzabyte.local`).

### 1.1 Configuración de Red en Spring Boot
En `pizzabyte-backend/src/main/resources/application.properties` se configuró:
```properties
server.port=8080
server.address=0.0.0.0
```
La directiva `server.address=0.0.0.0` permite que el servidor web escuche conexiones provenientes de **cualquier tarjeta de red** (Loopback `127.0.0.1`, Ethernet y WiFi local), no solo desde localhost.

### 1.2 Configuración del Archivo `hosts` en Windows (Equipo Host)
1. Abre el menú inicio, busca **Bloc de notas** (Notepad), haz clic derecho y selecciona **"Ejecutar como Administrador"**.
2. Abre el archivo:
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```
3. Agrega las siguientes líneas al final del archivo y guarda (`Ctrl + S`):
   ```text
   # Dominio Local para PizzaByte API y Web
   127.0.0.1       api.pizzabyte.local
   127.0.0.1       pizzabyte.local
   ```
4. ¡Listo! Ahora tu máquina reconoce de forma nativa `http://api.pizzabyte.local:8080`.

### 1.3 Acceso desde Otros Dispositivos en la Misma Red Local (WiFi/LAN)
Si el evaluador solicita abrir el sistema o la API desde otra laptop, tablet o teléfono en el mismo WiFi:
1. En tu máquina servidora, abre PowerShell y ejecuta:
   ```powershell
   ipconfig
   ```
   Ubica la **Dirección IPv4** de tu adaptador Wi-Fi o Ethernet (por ejemplo: `192.168.1.75`).
2. En las otras computadoras de la red local, edita su archivo `hosts` asociando esa IP:
   ```text
   192.168.1.75    api.pizzabyte.local
   192.168.1.75    pizzabyte.local
   ```
3. Desde el navegador o Postman de cualquier dispositivo conectado a ese WiFi, podrán acceder a:
   `http://api.pizzabyte.local:8080/api/db/status`

### 1.4 (Opcional Pro) Quitar el Puerto `:8080` usando PortProxy de Windows
Si deseas entrar directamente por el puerto estándar HTTP (puerto 80) sin escribir `:8080` (`http://api.pizzabyte.local`):
Ejecuta PowerShell como Administrador:
```powershell
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8080 connectaddress=127.0.0.1
```
*(Para revertir en cualquier momento: `netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0`)*

---

## 2. PUNTO 2: MÍNIMO 5 CONTROLADORES CRUD FUNCIONANDO

El backend cuenta con **5 controladores de negocio** con sus operaciones completas (Create, Read All, Read by ID, Update, Delete) conectadas a PostgreSQL bajo la arquitectura Controller ➔ Repository (Spring Data JPA) ➔ PostgreSQL Database:

| # | Controlador | Endpoint Base | Operaciones CRUD Soportadas | Entidad PostgreSQL |
|---|-------------|---------------|-----------------------------|--------------------|
| 1 | `ProductoController` | `/api/productos` | GET, GET `{id}`, POST, PUT `{id}`, DELETE `{id}` | `productos` |
| 2 | `IngredienteController` | `/api/ingredientes` | GET, GET `{id}`, POST, PUT `{id}`, DELETE `{id}` | `ingredientes` |
| 3 | `CuponController` | `/api/cupones` | GET, GET `{id}`, POST, PUT `{id}`, DELETE `{id}` | `cupones_descuento` |
| 4 | `PedidoController` | `/api/pedidos` | GET, GET `{id}`, POST, PUT `{id}`, DELETE `{id}` | `pedidos` |
| 5 | `UsuarioController` | `/api/usuarios` | GET, GET `{id}`, POST, PUT `{id}`, DELETE `{id}` | `usuarios` |
| * | `DbStatusController` | `/api/db/status` | GET (Diagnóstico de tablas, versión PG y latencia) | Diagnóstico |

Todos los controladores retornan respuestas estándar HTTP:
- `200 OK` en lecturas y actualizaciones exitosas.
- `201 Created` en inserciones exitosas.
- `204 No Content` en eliminaciones exitosas.
- `404 Not Found` si el recurso consultado o modificado no existe.

---

## 3. PUNTO 3: IMPLEMENTACIÓN Y FUNCIONAMIENTO DE LOS DERECHOS ARCO

Bajo la legislación de protección de datos personales (LFPDPPP), el titular de los datos tiene la facultad de ejercer cuatro derechos fundamentales: **Acceso, Rectificación, Cancelación y Oposición (ARCO)**.

PizzaByte implementa el módulo formal bajo el controlador `ArcoController` (`/api/arco`) respaldado por la tabla `solicitudes_arco` y campos de gobernanza en la tabla `usuarios`:

```
                 ┌─────────────────────────────────────────────────────────┐
                 │                TITULAR DE DATOS / CLIENTE               │
                 └──────────────┬────────────────────────────┬─────────────┘
                                │                            │
                 ┌──────────────▼────────────┐ ┌─────────────▼─────────────┐
                 │       [A] ACCESO          │ │     [R] RECTIFICACIÓN     │
                 │ Entrega expediente de los │ │ Corrige datos inexactos o │
                 │ datos tratados y pedidos  │ │ desactualizados con aviso │
                 └───────────────────────────┘ └───────────────────────────┘
                                │                            │
                 ┌──────────────▼────────────┐ ┌─────────────▼─────────────┐
                 │      [C] CANCELACIÓN      │ │       [O] OPOSICIÓN       │
                 │ Bloqueo legal de cuenta   │ │ Revoca consentimiento de  │
                 │ y cese de tratamiento     │ │ mercadotecnia/promociones │
                 └──────────────┬────────────┘ └─────────────┬─────────────┘
                                │                            │
                 ┌──────────────▼────────────────────────────▼─────────────┐
                 │    TABLA AUDITORÍA `solicitudes_arco` (FOLIO ÚNICO)     │
                 │    Cumplimiento normativo, timestamps y trazabilidad    │
                 └─────────────────────────────────────────────────────────┘
```

### 3.1 Derecho de ACCESO (A)
- **Endpoint:** `GET /api/arco/usuarios/{id}/acceso?motivo=Consulta+de+titular`
- **¿Qué hace?:** Genera un **Expediente Integral de Datos Personales** que incluye la información de cuenta del usuario, su teléfono, correo, direcciones registradas, y su historial completo de pedidos.
- **Evidencia Jurídica:** Genera y almacena un **Folio de Auditoría** único (`ARCO-ACC-XXXXXX`) con fecha y hora exacta.

### 3.2 Derecho de RECTIFICACIÓN (R)
- **Endpoint:** `PUT /api/arco/usuarios/{id}/rectificacion`
- **¿Qué hace?:** Permite al usuario actualizar sus datos inexactos o desactualizados (nombre completo, teléfono, correo).
- **Evidencia Jurídica:** Registra en la auditoría el detalle del cambio realizado (valores previos vs nuevos) y genera el folio `ARCO-REC-XXXXXX`.

### 3.3 Derecho de CANCELACIÓN (C)
- **Endpoint:** `POST /api/arco/usuarios/{id}/cancelacion`
- **¿Qué hace?:** Aplica el **periodo de bloqueo legal** estipulado por la ley:
  - Marca `bloqueado_arco = true` y `activo = false`.
  - Invalida el acceso del usuario para transacciones comerciales.
  - Conserva los registros de auditoría y facturación según lo exigen las leyes fiscales y comerciales.
- **Evidencia Jurídica:** Genera folio `ARCO-CAN-XXXXXX` registrando el cese de tratamiento de datos personales.

### 3.4 Derecho de OPOSICIÓN (O)
- **Endpoint:** `POST /api/arco/usuarios/{id}/oposicion`
- **¿Qué hace?:** El usuario se opone al tratamiento de sus datos para finalidades secundarias (marketing, boletines y notificaciones promocionales):
  - Establece `acepta_marketing = false`.
  - Mantiene activa la cuenta para finalidades primarias indispensables (entregar pizzas y procesar pedidos).
- **Evidencia Jurídica:** Genera folio `ARCO-OPO-XXXXXX`.

### 3.5 Consulta de Auditoría ARCO
- **Listar solicitudes:** `GET /api/arco/solicitudes`
- **Consultar por folio:** `GET /api/arco/solicitudes/{folio}`

---

## 4. PUNTO 4: MANUAL DE USO CON POSTMAN

En la raíz del proyecto se encuentra el archivo listo para importar:
`PizzaByte_API_Postman_Collection.json`

### 4.1 Cómo Importar la Colección en Postman
1. Abre **Postman**.
2. Haz clic en el botón superior izquierdo **"Import"** (o presiona `Ctrl + O`).
3. Arrastra el archivo `PizzaByte_API_Postman_Collection.json` a la ventana de Postman o haz clic en **"files"** y selecciónalo.
4. Verás aparecer en la barra lateral izquierda la colección **"PizzaByte API - Dominio, CRUDs y Derechos ARCO"**.

### 4.2 Variables de la Colección
La colección incluye por defecto la variable `baseUrl`:
- **Nombre:** `baseUrl`
- **Valor por defecto:** `http://api.pizzabyte.local:8080` (utiliza el dominio levantado).
- *(Nota: Si prefieres usar localhost, cámbiala a `http://localhost:8080`).*

### 4.3 Organización de las Carpetas en Postman
Dentro de la colección encontrarás 7 carpetas ordenadas lógicamente:
1. `0. Diagnóstico del Sistema`: Probar conexión a PostgreSQL y estado de tablas.
2. `1. CRUD Productos`: Create, Read All, Read One, Update, Delete pizzas.
3. `2. CRUD Ingredientes`: Gestión de inventario de masa, salsa, quesos y carnes.
4. `3. CRUD Cupones`: Gestión de descuentos comerciales y porcentajes.
5. `4. CRUD Pedidos`: Gestión de comandas de cocina y estado de pedidos.
6. `5. CRUD Usuarios`: Gestión de clientes, credenciales y perfiles.
7. `6. Módulo Derechos ARCO (LFPDPPP)`:
   - `[A] Ejercer Derecho de ACCESO`
   - `[R] Ejercer Derecho de RECTIFICACIÓN`
   - `[C] Ejercer Derecho de CANCELACIÓN`
   - `[O] Ejercer Derecho de OPOSICIÓN`
   - `Listar Auditoría de Solicitudes ARCO`
   - `Consultar Solicitud ARCO por Folio`

---

## 5. PUNTO 5: PLAN B CON LA TERMINAL (CURL Y POWERSHELL)

> **⚠️ IMPORTANTE PARA LA EVALUACIÓN:**  
> Si durante la presentación Postman no abre, se traba o el evaluador solicita ver las peticiones directamente desde la consola, utiliza los siguientes comandos. Están probados y listos para copiar y pegar.

### 5.1 Opción Automatizada: Script de Pruebas (El "Plan B Relámpago")
Ejecuta desde la terminal de tu proyecto:
```powershell
node test_crud_controllers.js
```
Este script ejecutará **25 pruebas completas** (Create, Read, Update, Delete para los 5 controladores y el diagnóstico) en menos de 3 segundos con salida a color y estadísticas.

---

### 5.2 Comandos Manuales con `curl` (Git Bash, CMD, Linux o PowerShell)

#### 🔍 Diagnóstico de Base de Datos
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/db/status"
```

---

#### 🍕 1. CRUD de PRODUCTOS (`/api/productos`)
**[C] Crear Producto:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/productos" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pizza Trufada Especial","descripcion":"Queso fior di latte con trufa negra","categoriaId":1,"precioBase":22.50,"tamanoPredeterminadoId":3,"activo":true}'
```

**[R] Leer Todos:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/productos"
```

**[R] Leer Uno (ID 1):**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/productos/1"
```

**[U] Actualizar Producto (ID 1):**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/productos/1" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pizza Margherita Clásica D.O.P.","precioBase":16.50,"activo":true}'
```

**[D] Eliminar Producto (ID 3):**
```bash
curl -i -X DELETE "http://api.pizzabyte.local:8080/api/productos/3"
```

---

#### 🧀 2. CRUD de INGREDIENTES (`/api/ingredientes`)
**[C] Crear Ingrediente:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/ingredientes" \
  -H "Content-Type: application/json" \
  -d '{"codigo":"ALB_FRESCA","nombre":"Albahaca Genovesa Fresca","categoria":"VEGETAL","esAlergeno":false,"stockActual":45.00,"unidadMedida":"GR","costoPorcion":0.75}'
```

**[R] Leer Todos:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/ingredientes"
```

**[U] Actualizar Stock (ID 1):**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/ingredientes/1" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Masa Madre Tradicional 48h","stockActual":120.00,"costoPorcion":1.20}'
```

**[D] Eliminar Ingrediente (ID 6):**
```bash
curl -i -X DELETE "http://api.pizzabyte.local:8080/api/ingredientes/6"
```

---

#### 🎟️ 3. CRUD de CUPONES (`/api/cupones`)
**[C] Crear Cupón:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/cupones" \
  -H "Content-Type: application/json" \
  -d '{"codigo":"EXAMEN100","tipoDescuento":"PORCENTAJE","valorDescuento":30.00,"montoMinimoPedido":20.00,"usosMaximos":50,"activo":true}'
```

**[R] Leer Todos:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/cupones"
```

**[U] Modificar Descuento (ID 1):**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/cupones/1" \
  -H "Content-Type: application/json" \
  -d '{"codigo":"PIZZABYTE20","tipoDescuento":"PORCENTAJE","valorDescuento":20.00,"activo":true}'
```

**[D] Eliminar Cupón (ID 3):**
```bash
curl -i -X DELETE "http://api.pizzabyte.local:8080/api/cupones/3"
```

---

#### 📦 4. CRUD de PEDIDOS (`/api/pedidos`)
**[C] Crear Pedido:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/pedidos" \
  -H "Content-Type: application/json" \
  -d '{"folioComanda":"PB-PRUEBA-99","clienteId":2,"origenPedido":"WEB","tipoEntrega":"A_DOMICILIO","direccionId":1,"notasCocina":"Masa extra crujiente","estadoId":1,"costoEnvio":2.50}'
```

**[R] Leer Todos los Pedidos:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/pedidos"
```

**[U] Actualizar Estado de Pedido (ID 1):**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/pedidos/1" \
  -H "Content-Type: application/json" \
  -d '{"estadoId":3,"notasCocina":"En horno de leña listo para empaque"}'
```

**[D] Cancelar/Eliminar Pedido (ID 2):**
```bash
curl -i -X DELETE "http://api.pizzabyte.local:8080/api/pedidos/2"
```

---

#### 👤 5. CRUD de USUARIOS (`/api/usuarios`)
**[C] Crear Usuario:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"username":"carlos_pizzalover","email":"carlos@pizzabyte.local","passwordHash":"hash_sha256_demo","nombreCompleto":"Carlos Mendoza","telefono":"5559876543","rolId":2,"activo":true}'
```

**[R] Leer Todos:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/usuarios"
```

**[U] Actualizar Usuario (ID 2):**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/usuarios/2" \
  -H "Content-Type: application/json" \
  -d '{"nombreCompleto":"Brandon Oliver (Cliente Frecuente)","telefono":"5559998877"}'
```

**[D] Desactivar/Eliminar Usuario (ID 3):**
```bash
curl -i -X DELETE "http://api.pizzabyte.local:8080/api/usuarios/3"
```

---

#### 🛡️ 6. EJERCER DERECHOS ARCO (LFPDPPP)

**[A] Acceso - Obtener Expediente y Trazabilidad:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/arco/usuarios/2/acceso?motivo=Auditoria+Academica"
```

**[R] Rectificación - Corregir Datos Inexactos:**
```bash
curl -i -X PUT "http://api.pizzabyte.local:8080/api/arco/usuarios/2/rectificacion" \
  -H "Content-Type: application/json" \
  -d '{"nombreCompleto":"Brandon Oliver Actualizado","telefono":"5554321098","motivo":"Actualizacion de numero telefonico particular"}'
```

**[C] Cancelación - Bloqueo Legal de Cuenta:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/arco/usuarios/2/cancelacion" \
  -H "Content-Type: application/json" \
  -d '{"motivo":"Solicitud formal de cancelacion y cese de uso de datos"}'
```

**[O] Oposición - Revocar Uso para Mercadotecnia:**
```bash
curl -i -X POST "http://api.pizzabyte.local:8080/api/arco/usuarios/2/oposicion" \
  -H "Content-Type: application/json" \
  -d '{"motivo":"Deseo no recibir publicidad ni correos comerciales"}'
```

**Consultar Registro Histórico de Solicitudes ARCO:**
```bash
curl -i -X GET "http://api.pizzabyte.local:8080/api/arco/solicitudes"
```

---

### 5.3 Comandos Nativos de PowerShell (`Invoke-RestMethod`)

Si estás en PowerShell y prefieres ver la salida parseada como objetos:

```powershell
# 1. Diagnóstico
Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/db/status" -Method GET | Format-List

# 2. CRUD Productos (Listar)
Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/productos" -Method GET | Format-Table id, nombre, precioBase, activo

# 3. CRUD Ingredientes (Listar)
Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/ingredientes" -Method GET | Format-Table id, codigo, nombre, stockActual

# 4. CRUD Cupones (Crear cupón con PowerShell)
$bodyCupon = @{
    codigo = "PROFE100"
    tipoDescuento = "PORCENTAJE"
    valorDescuento = 50.00
    montoMinimoPedido = 15.00
    usosMaximos = 100
    activo = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/cupones" -Method POST -Body $bodyCupon -ContentType "application/json"

# 5. Derechos ARCO: Ejercer Derecho de Acceso
$expediente = Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/arco/usuarios/2/acceso" -Method GET
$expediente | ConvertTo-Json -Depth 5
```

---

## 6. RESUMEN DE RESPUESTAS A CRITERIOS DE EVALUACIÓN

| Criterio | ¿Cumple? | Cómo demostrarlo al Evaluador |
|---|:---:|---|
| **Levantamiento de Dominio** | ✅ SÍ | Mostrar la URL `http://api.pizzabyte.local:8080` funcionando en Postman o en el navegador, y mostrar el mapeo en `C:\Windows\System32\drivers\etc\hosts`. |
| **Mínimo 5 Controladores CRUD** | ✅ SÍ | Mostrar en Postman o ejecutar `node test_crud_controllers.js` mostrando los 5 controladores (`Productos`, `Ingredientes`, `Cupones`, `Pedidos`, `Usuarios`) con C-R-U-D. |
| **Derechos ARCO** | ✅ SÍ | Ejecutar `GET /api/arco/usuarios/2/acceso`, `POST /api/arco/usuarios/2/oposicion`, `POST /api/arco/usuarios/2/cancelacion`, mostrando la generación de folios y el cambio de estado en PostgreSQL (`bloqueado_arco`, `acepta_marketing`). |
| **Manual Postman y Plan B** | ✅ SÍ | Colección `PizzaByte_API_Postman_Collection.json` importada con todas las peticiones, y este manual `MANUAL_POSTMAN_Y_PLAN_B_TERMINAL.md` con todos los comandos `curl` y PowerShell listos. |
