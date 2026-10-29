# -*- coding: utf-8 -*-
"""
Generador del Manual Técnico de Evaluación en formato Word (.docx)
Proyecto: PizzaByte
Autor: Antigravity AI & Brandon Oliver
"""

import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    # Remove existing shd if any
    for child in list(tcPr):
        if child.tag.endswith('shd'):
            tcPr.remove(child)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    
    borders = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
    for border_name, border_style in borders.items():
        if border_style:
            val, sz, color = border_style
            b_elm = parse_xml(f'<w:{border_name} {nsdecls("w")} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>')
            tcBorders.append(b_elm)
        else:
            b_elm = parse_xml(f'<w:{border_name} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_elm)
            
    tcPr.append(tcBorders)

def add_header_footer(doc):
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)
        
        # Header
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("PIZZABYTE  |  MANUAL TÉCNICO DE EVALUACIÓN BACKEND")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(140, 140, 140)
        
        # Footer
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Spring Boot 3.3.5 • PostgreSQL 18 • Dominio Local • CRUDs • Derechos ARCO • Postman & Terminal")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(140, 140, 140)

def add_styled_heading(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    run = h.runs[0]
    run.font.name = "Segoe UI"
    if level == 1:
        run.font.size = Pt(17)
        run.font.bold = True
        run.font.color.rgb = RGBColor(179, 38, 30) # PizzaByte Red
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(44, 62, 80) # Navy
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = RGBColor(80, 90, 100)
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
    return h

def add_paragraph(doc, text="", bold_prefix="", italic_prefix="", space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Calibri"
        r_bold.font.size = Pt(10.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(30, 30, 30)
        
    if italic_prefix:
        r_it = p.add_run(italic_prefix)
        r_it.font.name = "Calibri"
        r_it.font.size = Pt(10.5)
        r_it.font.italic = True
        r_it.font.color.rgb = RGBColor(80, 80, 80)
        
    if text:
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(10.5)
        r_text.font.color.rgb = RGBColor(50, 50, 50)
        
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Calibri"
        r_bold.font.size = Pt(10.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(30, 30, 30)
    if text:
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(10.5)
        r_text.font.color.rgb = RGBColor(50, 50, 50)
    return p

def add_code_block(doc, code_str, language="BASH"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.8)
    set_cell_background(cell, "F8F9FA")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    set_cell_borders(cell, left=('single', '24', 'B3261E'), top=('single', '4', 'E0E0E0'), bottom=('single', '4', 'E0E0E0'), right=('single', '4', 'E0E0E0'))
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    
    run = p.add_run(code_str.strip())
    run.font.name = "Consolas"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor(33, 47, 61)
    
    # Empty space after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(4)

def add_callout(doc, title, text, box_type="NOTE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.8)
    
    if box_type == "IMPORTANT":
        bg_color = "FDEDEC"
        border_color = "C0392B"
        title_color = RGBColor(192, 57, 43)
        icon = "⚠️ IMPORTANTE: "
    elif box_type == "LEGAL":
        bg_color = "EBF5FB"
        border_color = "2980B9"
        title_color = RGBColor(41, 128, 185)
        icon = "⚖️ FUNDAMENTO LEGAL: "
    elif box_type == "TIP":
        bg_color = "EAFAF1"
        border_color = "27AE60"
        title_color = RGBColor(39, 174, 96)
        icon = "💡 CONSEJO PARA LA EVALUACIÓN: "
    else:
        bg_color = "F4F6F7"
        border_color = "7F8C8D"
        title_color = RGBColor(44, 62, 80)
        icon = "📌 NOTA: "
        
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    set_cell_borders(cell, left=('single', '28', border_color), top=('single', '4', 'D5D8DC'), bottom=('single', '4', 'D5D8DC'), right=('single', '4', 'D5D8DC'))
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(icon + title + "\n")
    r_title.font.name = "Segoe UI"
    r_title.font.size = Pt(9.5)
    r_title.font.bold = True
    r_title.font.color.rgb = title_color
    
    r_body = p.add_run(text)
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(50, 50, 50)
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(4)

def add_styled_table(doc, headers, data, col_widths=None):
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Format Header Row
    header_row = table.rows[0]
    header_tr = header_row._tr.get_or_add_trPr()
    header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    
    for i, title in enumerate(headers):
        cell = header_row.cells[i]
        set_cell_background(cell, "2C3E50") # Dark slate
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        set_cell_borders(cell, bottom=('single', '16', '1A252F'), top=('single', '8', '2C3E50'), left=('single', '4', '34495E'), right=('single', '4', '34495E'))
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.font.name = "Segoe UI"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        
    # Format Data Rows
    for row_idx, row_data in enumerate(data):
        row = table.rows[row_idx + 1]
        bg = "FFFFFF" if row_idx % 2 == 0 else "F8F9F9"
        for col_idx, cell_value in enumerate(row_data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            set_cell_borders(cell, bottom=('single', '4', 'E5E7E9'), top=('single', '4', 'E5E7E9'), left=('single', '4', 'E5E7E9'), right=('single', '4', 'E5E7E9'))
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            
            # Align center for short columns like method or status
            if len(str(cell_value)) <= 6 or str(cell_value).startswith("✅") or str(cell_value) in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
            run = p.add_run(str(cell_value))
            run.font.name = "Calibri"
            run.font.size = Pt(9.0)
            run.font.color.rgb = RGBColor(40, 40, 40)
            
    # Apply widths if provided
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)
                
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(6)


def generate_document():
    doc = Document()
    add_header_footer(doc)
    
    # ----------------------------------------------------
    # PORTADA
    # ----------------------------------------------------
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(40)
    p_pre.paragraph_format.space_after = Pt(10)
    r_tag = p_pre.add_run("PIZZABYTE ENTERPRISE  •  SISTEMA DE GESTIÓN Y API REST")
    r_tag.font.name = "Segoe UI"
    r_tag.font.size = Pt(10)
    r_tag.font.bold = True
    r_tag.font.color.rgb = RGBColor(179, 38, 30)
    
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(12)
    p_title.paragraph_format.line_spacing = 1.1
    r_main_title = p_title.add_run("MANUAL TÉCNICO DE EVALUACIÓN:\nLEVANTAMIENTO DE DOMINIO LOCAL, CONTROLADORES SPRING BOOT CRUD, DERECHOS ARCO Y CONTINGENCIA EN TERMINAL")
    r_main_title.font.name = "Segoe UI"
    r_main_title.font.size = Pt(21)
    r_main_title.font.bold = True
    r_main_title.font.color.rgb = RGBColor(44, 62, 80)
    
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(30)
    r_sub = p_sub.add_run("Guía Integral de Demostración y Ejecución Práctica para Criterios Universitarios de Arquitectura de Software y Gobernanza de Datos")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(100, 110, 120)
    
    # Info Box en Portada
    add_callout(doc, "FICHA TÉCNICA DEL PROYECTO",
        "• Stack Tecnológico: Java 21 / 25, Spring Boot 3.3.5, Spring Data JPA, Hibernate ORM.\n"
        "• Motor de Base de Datos: PostgreSQL 18 (Esquema 'pizzabyte_core', Normalizado en 3NF).\n"
        "• Dominio Local Registrado: http://api.pizzabyte.local:8080 (Mapeo DNS en hosts y 0.0.0.0).\n"
        "• Gobernanza de Datos: Módulo nativo de Derechos ARCO (Conforme a la LFPDPPP mexicana).\n"
        "• Herramientas de Prueba: Colección Postman v2.1 y Suite Automatizada Node.js/PowerShell.\n"
        "• Repositorio Oficial: https://github.com/BrandonOliver369/pizzabyte.git",
        box_type="NOTE"
    )
    
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(80)
    p_meta.paragraph_format.space_after = Pt(0)
    r_meta = p_meta.add_run("Elaborado para: Evaluación Colegiada de Ingeniería de Software / Base de Datos\nFecha de Emisión: Octubre 2026\nVersión del Documento: 2.0 (Certificada para Evaluación)")
    r_meta.font.name = "Calibri"
    r_meta.font.size = Pt(9.5)
    r_meta.font.color.rgb = RGBColor(120, 120, 120)
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # ÍNDICE GENERAL
    # ----------------------------------------------------
    add_styled_heading(doc, "ÍNDICE GENERAL DEL MANUAL", level=1)
    
    add_paragraph(doc, "Este documento está estructurado de manera directa para responder con exactitud técnica a los 4 puntos evaluados en el examen colegiado:", space_after=8)
    
    add_bullet(doc, "Sustitución de direcciones IP y localhost por dominio propio en red local (hosts, Tomcat 0.0.0.0 y PortProxy puerto 80).", bold_prefix="1. Levantamiento de Dominio en Red Local: ")
    add_bullet(doc, "Arquitectura Spring Data JPA con 5 controladores de negocio (Productos, Ingredientes, Cupones, Pedidos, Usuarios) y diagnóstico del sistema.", bold_prefix="2. Mínimo 5 Controladores CRUD en Spring Boot: ")
    add_bullet(doc, "Mecanismo jurídico-técnico para el ejercicio de Acceso, Rectificación, Cancelación y Oposición según la LFPDPPP.", bold_prefix="3. Funcionamiento de los Derechos ARCO: ")
    add_bullet(doc, "Instrucciones de importación de la colección PizzaByte_API_Postman_Collection.json, variables y pruebas.", bold_prefix="4. Manual de Uso con Postman: ")
    add_bullet(doc, "Guía de respaldo con comandos copy-paste de curl, PowerShell y script de prueba relámpago en 2 segundos.", bold_prefix="5. PLAN B de Contingencia con la Terminal: ")
    add_bullet(doc, "Tabla de chequeo con evidencias directas para presentar al docente.", bold_prefix="6. Matriz de Evaluación y Checklist de Presentación: ")
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 1: LEVANTAMIENTO DE DOMINIO LOCAL
    # ----------------------------------------------------
    add_styled_heading(doc, "1. LEVANTAMIENTO DE DOMINIO EN RED LOCAL", level=1)
    
    add_paragraph(doc, 
        "El objetivo principal de este requerimiento es erradicar el uso de direcciones genéricas como http://localhost:8080 o direcciones IP numéricas poco intuitivas (ej. http://192.168.1.75:8080), permitiendo que la plataforma y su API REST respondan institucionalmente bajo los dominios http://api.pizzabyte.local:8080 o http://pizzabyte.local."
    )
    
    add_styled_heading(doc, "1.1 Configuración de Red en el Backend (Spring Boot)", level=2)
    add_paragraph(doc, 
        "Por defecto, muchos servidores embebidos únicamente aceptan peticiones provenientes del adaptador local de loopback (127.0.0.1). Para permitir el consumo desde cualquier dispositivo conectado a la red local (Ethernet o WiFi), se configuró la propiedad server.address en el archivo application.properties:"
    )
    
    add_code_block(doc, 
        "# Archivo: pizzabyte-backend/src/main/resources/application.properties\n"
        "server.port=8080\n"
        "server.address=0.0.0.0\n\n"
        "# Conexión a Base de Datos PostgreSQL 18\n"
        "spring.datasource.url=jdbc:postgresql://localhost:5432/pizzabyte_db?currentSchema=pizzabyte_core\n"
        "spring.datasource.username=postgres\n"
        "spring.datasource.password=root"
    )
    
    add_paragraph(doc, 
        "La directiva server.address=0.0.0.0 instruye al servidor web Tomcat a enlazarse (bind) a todas las interfaces de red físicas y virtuales de la computadora anfitriona.", bold_prefix="Efecto técnico: "
    )
    
    add_styled_heading(doc, "1.2 Mapeo de Nombres de Dominio en el Equipo Servidor (Windows hosts)", level=2)
    add_paragraph(doc, 
        "El archivo hosts actúa como un servidor DNS local prioritario que el sistema operativo consulta antes de recurrir a la red externa. Para asociar el dominio a la máquina local, se siguen estos pasos:"
    )
    
    add_bullet(doc, "Abre el menú Inicio de Windows, escribe Bloc de Notas (Notepad), haz clic derecho y pulsa 'Ejecutar como Administrador'.")
    add_bullet(doc, "Abre el archivo localizado en la ruta del sistema: C:\\Windows\\System32\\drivers\\etc\\hosts (selecciona 'Todos los archivos (*.*)' en el diálogo de apertura).")
    add_bullet(doc, "Añade al final del archivo las siguientes líneas de resolución:")
    
    add_code_block(doc, 
        "# Dominio Local para PizzaByte API y Web Platform\n"
        "127.0.0.1       api.pizzabyte.local\n"
        "127.0.0.1       pizzabyte.local"
    )
    
    add_bullet(doc, "Guarda los cambios (Ctrl + S). Inmediatamente el sistema resolverá peticiones dirigidas a api.pizzabyte.local sin requerir reiniciar la computadora.")
    
    add_styled_heading(doc, "1.3 Acceso desde otros Equipos en la misma Red Local (WiFi o Cable LAN)", level=2)
    add_paragraph(doc, 
        "Si el evaluador solicita abrir el sistema o invocar los controladores desde otra computadora, laptop o teléfono conectado al mismo router WiFi:"
    )
    
    add_bullet(doc, "En la computadora servidora de PizzaByte, abre PowerShell y consulta la IP local ejecutando: ipconfig")
    add_bullet(doc, "Localiza la línea 'Dirección IPv4' del adaptador de red activo (por ejemplo: 192.168.1.75).")
    add_bullet(doc, "En la computadora del evaluador o del cliente, añade a su propio archivo hosts la asociación con tu IP:")
    
    add_code_block(doc, 
        "# En la máquina del evaluador o cliente LAN:\n"
        "192.168.1.75    api.pizzabyte.local\n"
        "192.168.1.75    pizzabyte.local"
    )
    
    add_bullet(doc, "Desde el navegador o Postman del cliente podrán consultar la API con: http://api.pizzabyte.local:8080/api/db/status")
    
    add_styled_heading(doc, "1.4 Eliminación del Puerto :8080 mediante PortProxy de Windows (Opcional Avanzado)", level=2)
    add_paragraph(doc, 
        "Si se desea ingresar a la API por el puerto estándar HTTP (puerto 80) sin tener que tipear :8080 (quedando simplemente http://api.pizzabyte.local), se puede activar el reenvío de puertos nativo del kernel de Windows:"
    )
    
    add_code_block(doc, 
        "# Ejecutar en PowerShell como Administrador:\n"
        "netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8080 connectaddress=127.0.0.1\n\n"
        "# Para consultar el estado del proxy:\n"
        "netsh interface portproxy show all\n\n"
        "# (Para revertir cuando termine la evaluación):\n"
        "netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0"
    )
    
    add_callout(doc, "COMPROBACIÓN INMEDIATA DEL DOMINIO",
        "Abre cualquier navegador web y navega a:\n"
        "http://api.pizzabyte.local:8080/api/db/status\n\n"
        "Obtendrás un JSON con conectado: true, confirmando que el dominio, el servidor Spring Boot y PostgreSQL 18 están totalmente sincronizados.",
        box_type="TIP"
    )
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 2: CONTROLADORES CRUD SPRING BOOT
    # ----------------------------------------------------
    add_styled_heading(doc, "2. MÍNIMO 5 CONTROLADORES CRUD FUNCIONANDO EN SPRING BOOT", level=1)
    
    add_paragraph(doc, 
        "La arquitectura del backend implementa el patrón por capas empresarial: Controller ➔ Service/Repository (Spring Data JPA) ➔ Driver JDBC HikariCP ➔ PostgreSQL 18. El esquema de datos 'pizzabyte_core' se encuentra normalizado en Tercera Forma Normal (3NF) y soporta integridad referencial estricta."
    )
    
    add_paragraph(doc, 
        "A continuación se detallan los 5 controladores principales de negocio que cuentan con operaciones CRUD completas, más los controladores de soporte y gobernanza:"
    )
    
    table_headers = ["Controlador", "Endpoint Base", "Operaciones CRUD", "Entidad / Tabla", "Estado"]
    table_data = [
        ["ProductoController", "/api/productos", "POST, GET, GET {id}, PUT, DELETE", "productos", "✅ OPERATIVO"],
        ["IngredienteController", "/api/ingredientes", "POST, GET, GET {id}, PUT, DELETE", "ingredientes", "✅ OPERATIVO"],
        ["CuponController", "/api/cupones", "POST, GET, GET {id}, PUT, DELETE", "cupones_descuento", "✅ OPERATIVO"],
        ["PedidoController", "/api/pedidos", "POST, GET, GET {id}, PUT, DELETE", "pedidos", "✅ OPERATIVO"],
        ["UsuarioController", "/api/usuarios", "POST, GET, GET {id}, PUT, DELETE", "usuarios", "✅ OPERATIVO"],
        ["DbStatusController", "/api/db/status", "GET (Diagnóstico del sistema)", "Metadatos y latencia", "✅ OPERATIVO"],
        ["ArcoController", "/api/arco", "GET, POST, PUT (Acceso, Rect, Canc, Opos)", "solicitudes_arco", "✅ OPERATIVO"]
    ]
    add_styled_table(doc, table_headers, table_data, col_widths=[1.5, 1.2, 1.8, 1.2, 1.1])
    
    add_styled_heading(doc, "2.1 Detalle Técnico de los Controladores", level=2)
    
    add_styled_heading(doc, "Controlador 1: ProductoController (/api/productos)", level=3)
    add_paragraph(doc, "Permite la gestión integral del menú gourmet de pizzas, precios base, categorías e ingredientes asociados.")
    add_bullet(doc, "POST /api/productos - Crea una nueva pizza con validación de categoría y tamaño por defecto.")
    add_bullet(doc, "GET /api/productos - Retorna el catálogo completo con estatus activo.")
    add_bullet(doc, "GET /api/productos/{id} - Devuelve la ficha técnica de la pizza con sus ingredientes de receta.")
    add_bullet(doc, "PUT /api/productos/{id} - Actualiza precio base, nombre, descripción y estatus.")
    add_bullet(doc, "DELETE /api/productos/{id} - Da de baja el producto de la carta comercial.")
    
    add_styled_heading(doc, "Controlador 2: IngredienteController (/api/ingredientes)", level=3)
    add_paragraph(doc, "Gestiona el inventario de cocina para masas, quesos finos, vegetales frescos y embutidos italianos.")
    add_bullet(doc, "POST /api/ingredientes - Registra nuevo insumo con costo por porción, unidad de medida y alerta de alérgenos.")
    add_bullet(doc, "GET /api/ingredientes - Lista el inventario completo y existencias actuales.")
    add_bullet(doc, "PUT /api/ingredientes/{id} - Ajusta existencias (stock) o costo de porción adicional.")
    add_bullet(doc, "DELETE /api/ingredientes/{id} - Da de baja el ingrediente del almacén.")
    
    add_styled_heading(doc, "Controlador 3: CuponController (/api/cupones)", level=3)
    add_paragraph(doc, "Maneja la lógica comercial de promociones por porcentaje, montos fijos y restricciones de consumo.")
    add_bullet(doc, "POST /api/cupones - Crea código promocional con límite de usos y fecha de expiración.")
    add_bullet(doc, "GET /api/cupones - Lista todos los cupones activos del sistema.")
    add_bullet(doc, "GET /api/cupones/{codigo} - Valida en tiempo real la vigencia del cupón antes del pago.")
    add_bullet(doc, "PUT /api/cupones/{id} - Modifica el valor del beneficio o extiende la fecha de caducidad.")
    add_bullet(doc, "DELETE /api/cupones/{id} - Invalida permanentemente un cupón promocional.")
    
    add_styled_heading(doc, "Controlador 4: PedidoController (/api/pedidos)", level=3)
    add_paragraph(doc, "Punto neurálgico del Kitchen Display System (KDS), comanda digital y transiciones de estado de cocina.")
    add_bullet(doc, "POST /api/pedidos - Crea comanda con asignación de cliente, dirección, método de entrega y notas de chef.")
    add_bullet(doc, "GET /api/pedidos - Lista las comandas en curso para la vista KDS de pizzeros.")
    add_bullet(doc, "PUT /api/pedidos/{id} - Transiciona el estado de la comanda (RECIBIDO ➔ EN_HORNO ➔ EN_RUTA ➔ ENTREGADO).")
    add_bullet(doc, "DELETE /api/pedidos/{id} - Cancela comanda y audita la causa de cancelación.")
    
    add_styled_heading(doc, "Controlador 5: UsuarioController (/api/usuarios)", level=3)
    add_paragraph(doc, "Administra clientes, administradores y personal de cocina, manejando hashes seguros de contraseñas.")
    add_bullet(doc, "POST /api/usuarios - Registra nuevo usuario con rol de cliente o staff.")
    add_bullet(doc, "GET /api/usuarios - Lista usuarios con sus respectivos roles y marcas de tiempo.")
    add_bullet(doc, "GET /api/usuarios/{id} - Consulta perfil individual con datos de contacto.")
    add_bullet(doc, "PUT /api/usuarios/{id} - Actualiza perfil (nombre completo, teléfono, correo).")
    add_bullet(doc, "DELETE /api/usuarios/{id} - Baja lógica o física del usuario en el sistema.")
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 3: DERECHOS ARCO (LFPDPPP)
    # ----------------------------------------------------
    add_styled_heading(doc, "3. FUNCIONAMIENTO DE LOS DERECHOS ARCO (LFPDPPP)", level=1)
    
    add_callout(doc, "MARCO JURÍDICO APLICABLE EN MÉXICO",
        "Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, el titular de los datos personales tiene el derecho inalienable de Acceder, Rectificar, Cancelar u Oponerse al tratamiento de su información.\n\n"
        "PizzaByte implementa un módulo nativo respaldado por el controlador ArcoController.java, auditado por la tabla solicitudes_arco en PostgreSQL, garantizando trazabilidad con fecha, hora, motivo y folio único por trámite.",
        box_type="LEGAL"
    )
    
    add_paragraph(doc, 
        "La base de datos cuenta con dos columnas de control en la tabla usuarios y una tabla dedicada de auditoría legal:", bold_prefix="Estructura de Base de Datos: "
    )
    add_bullet(doc, "usuarios.acepta_marketing (BOOLEAN) - Modificado por el derecho de Oposición para revocar finalidades secundarias.")
    add_bullet(doc, "usuarios.bloqueado_arco (BOOLEAN) - Modificado por el derecho de Cancelación para bloquear la cuenta de operaciones comerciales mientras transcurre el periodo de bloqueo legal.")
    add_bullet(doc, "solicitudes_arco - Almacena folio (UUID/String único), tipo_derecho, usuario_id, motivo, estado ('ATENDIDA'), datos_especificos y timestamps de solicitud y resolución.")
    
    add_styled_heading(doc, "3.1 [A] Derecho de ACCESO", level=2)
    add_paragraph(doc, 
        "Permite al titular conocer qué datos personales obran en la plataforma, las finalidades de su tratamiento y las transacciones comerciales vinculadas a su perfil.", bold_prefix="Definición Legal: "
    )
    add_bullet(doc, "GET /api/arco/usuarios/{id}/acceso?motivo=Consulta+de+titular", bold_prefix="Endpoint: ")
    add_bullet(doc, "Entrega un Expediente Integral en formato JSON que reúne: identidad del titular (nombre, correo, teléfono, fecha de registro), preferencias de privacidad y su historial completo de comandas y transacciones.", bold_prefix="Efecto: ")
    add_bullet(doc, "Registra automáticamente en la tabla solicitudes_arco el folio ARCO-ACC-XXXX con la estampa de tiempo.", bold_prefix="Auditoría: ")
    
    add_styled_heading(doc, "3.2 [R] Derecho de RECTIFICACIÓN", level=2)
    add_paragraph(doc, 
        "El titular puede exigir la corrección de sus datos personales cuando estos resulten inexactos, incompletos o desactualizados.", bold_prefix="Definición Legal: "
    )
    add_bullet(doc, "PUT /api/arco/usuarios/{id}/rectificacion", bold_prefix="Endpoint: ")
    add_bullet(doc, "Actualiza inmediatamente en PostgreSQL los campos corregidos (nombre_completo, telefono, email).", bold_prefix="Efecto: ")
    add_bullet(doc, "Registra en solicitudes_arco el folio ARCO-REC-XXXX guardando en datos_especificos la constancia de los cambios solicitados.", bold_prefix="Auditoría: ")
    
    add_styled_heading(doc, "3.3 [C] Derecho de CANCELACIÓN", level=2)
    add_paragraph(doc, 
        "Da lugar al cese del tratamiento de datos mediante el bloqueo previo de los mismos. La ley estipula que los datos no se borran físicamente si existen obligaciones fiscales o contractuales pendientes (ej. auditorías tributarias de facturas), sino que se colocan en periodo de bloqueo legal.", bold_prefix="Definición Legal: "
    )
    add_bullet(doc, "POST /api/arco/usuarios/{id}/cancelacion", bold_prefix="Endpoint: ")
    add_bullet(doc, "Establece en PostgreSQL bloqueado_arco = true y activo = false. El usuario queda inhabilitado para realizar nuevos pedidos o iniciar sesión.", bold_prefix="Efecto: ")
    add_bullet(doc, "Registra en solicitudes_arco el folio ARCO-CAN-XXXX certificando el bloqueo legal por cese de tratamiento.", bold_prefix="Auditoría: ")
    
    add_styled_heading(doc, "3.4 [O] Derecho de OPOSICIÓN", level=2)
    add_paragraph(doc, 
        "Faculta al titular a oponerse al tratamiento de sus datos para finalidades secundarias (mercadotecnia, publicidad, envío de promociones o prospección comercial), manteniendo activa su cuenta para finalidades primarias indispensables (entrega de pedidos).", bold_prefix="Definición Legal: "
    )
    add_bullet(doc, "POST /api/arco/usuarios/{id}/oposicion", bold_prefix="Endpoint: ")
    add_bullet(doc, "Establece en PostgreSQL acepta_marketing = false. El cliente sigue activo para ordenar comida pero es excluido de cualquier campaña publicitaria.", bold_prefix="Efecto: ")
    add_bullet(doc, "Registra en solicitudes_arco el folio ARCO-OPO-XXXX certificando la revocación publicitaria.", bold_prefix="Auditoría: ")
    
    add_styled_heading(doc, "3.5 Consulta de Auditoría y Expedientes ARCO", level=2)
    add_paragraph(doc, "Los directivos y auditores pueden auditar el historial de atenciones mediante:")
    add_bullet(doc, "GET /api/arco/solicitudes - Listado cronológico de todas las solicitudes atendidas.")
    add_bullet(doc, "GET /api/arco/solicitudes/{folio} - Búsqueda de una solicitud por su folio de seguimiento único.")
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 4: MANUAL DE POSTMAN
    # ----------------------------------------------------
    add_styled_heading(doc, "4. MANUAL DE USO CON POSTMAN", level=1)
    
    add_paragraph(doc, 
        "Para facilitar la evaluación interactiva, el proyecto incluye el archivo de exportación estándar Postman Collection v2.1: PizzaByte_API_Postman_Collection.json ubicado en la raíz del repositorio."
    )
    
    add_styled_heading(doc, "4.1 Pasos para Importar la Colección", level=2)
    add_bullet(doc, "Inicia la aplicación Postman en tu computadora.")
    add_bullet(doc, "Haz clic en el botón 'Import' situado en la esquina superior izquierda (o utiliza el atajo de teclado Ctrl + O).")
    add_bullet(doc, "Arrastra el archivo PizzaByte_API_Postman_Collection.json a la ventana o selecciónalo con el explorador de archivos.")
    add_bullet(doc, "Confirma la importación. Verás aparecer en tu barra lateral la colección: 'PizzaByte API - Dominio, CRUDs y Derechos ARCO'.")
    
    add_styled_heading(doc, "4.2 Variable de Entorno y Dominio", level=2)
    add_paragraph(doc, 
        "La colección viene preconfigurada con la variable de nivel de colección {{baseUrl}} apuntando al dominio local levantado:"
    )
    add_bullet(doc, "Nombre de la Variable: baseUrl")
    add_bullet(doc, "Valor Inicial y Actual: http://api.pizzabyte.local:8080")
    add_paragraph(doc, "Si por algún motivo no configuraste el archivo hosts, puedes cambiar el valor de {{baseUrl}} a http://localhost:8080 y todas las peticiones continuarán funcionando de forma transparente.", italic_prefix="Flexibilidad: ")
    
    add_styled_heading(doc, "4.3 Estructura de Carpetas de la Colección", level=2)
    add_paragraph(doc, "La colección contiene 7 carpetas ordenadas lógicamente:")
    
    postman_folders = [
        ["0. Diagnóstico del Sistema", "GET /api/db/status", "Valida conexión activa a PostgreSQL 18, esquema y latencia."],
        ["1. CRUD Productos", "POST, GET, PUT, DELETE", "Prueba integral de gestión de pizzas en carta comercial."],
        ["2. CRUD Ingredientes", "POST, GET, PUT, DELETE", "Prueba de inventario de masa madre, quesos y embutidos."],
        ["3. CRUD Cupones", "POST, GET, PUT, DELETE", "Prueba de descuentos comerciales y códigos de beneficio."],
        ["4. CRUD Pedidos", "POST, GET, PUT, DELETE", "Comandas de cocina KDS, asignación y cambios de estado."],
        ["5. CRUD Usuarios", "POST, GET, PUT, DELETE", "Gestión de perfiles de clientes y personal."],
        ["6. Módulo Derechos ARCO", "GET, POST, PUT", "Pruebas de Acceso, Rectificación, Cancelación y Oposición."]
    ]
    add_styled_table(doc, ["Carpeta", "Endpoints", "Propósito de la Prueba"], postman_folders, col_widths=[1.8, 1.8, 3.2])
    
    add_styled_heading(doc, "4.4 Ejecución Masiva con 'Collection Runner'", level=2)
    add_paragraph(doc, 
        "Para impresionar al evaluador demostrando todas las peticiones en una sola corrida automatizada:"
    )
    add_bullet(doc, "Haz clic en los tres puntos (...) a la derecha de la colección 'PizzaByte API' en Postman.")
    add_bullet(doc, "Selecciona 'Run collection' (Runner).")
    add_bullet(doc, "Haz clic en el botón azul 'Run PizzaByte API'.")
    add_bullet(doc, "Postman ejecutará secuencialmente cada endpoint mostrando respuestas HTTP 200 OK y 201 Created en verde.")
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 5: PLAN B CON LA TERMINAL
    # ----------------------------------------------------
    add_styled_heading(doc, "5. PLAN B DE CONTINGENCIA CON LA TERMINAL (CURL Y POWERSHELL)", level=1)
    
    add_callout(doc, "PROTOCOLO DE CONTINGENCIA ANTE FALLOS DE POSTMAN",
        "Si durante la evaluación frente al jurado o profesor Postman sufre lentitud, no arranca o el evaluador solicita expresamente ver el funcionamiento a bajo nivel desde la consola, este Plan B contiene todos los comandos directos probados listos para copiar y pegar.\n\n"
        "Ninguna falla de interfaz gráfica detendrá tu demostración.",
        box_type="IMPORTANT"
    )
    
    add_styled_heading(doc, "5.1 Plan B Relámpago: Batería Automatizada en 2 Segundos", level=2)
    add_paragraph(doc, 
        "El proyecto incluye un script en Node.js que ejecuta las 25 pruebas CRUD y de diagnóstico conectándose al backend en Spring Boot y PostgreSQL 18:"
    )
    add_code_block(doc, "node test_crud_controllers.js", language="CMD")
    add_paragraph(doc, "Salida esperada en consola:", bold_prefix="Resultado: ")
    add_code_block(doc, 
        "================================================================\n"
        " 🧪 INICIANDO BATERÍA DE PRUEBAS CRUD EN POSTGRESQL (PIZZABYTE) \n"
        "================================================================\n"
        "🔌 Conexión confirmada con PostgreSQL 18 [pizzabyte_db.pizzabyte_core]\n\n"
        "--- 1. CONTROLADOR DE PRODUCTOS (CRUD) ---\n"
        "✅ [1] PRODUCTOS - CREATE: Insertar nueva pizza en PostgreSQL\n"
        "✅ [2] PRODUCTOS - READ ALL: Listar catálogo completo\n"
        "✅ [3] PRODUCTOS - READ ONE: Consultar producto por ID con receta\n"
        "✅ [4] PRODUCTOS - UPDATE: Modificar precio y descripción\n"
        "✅ [5] PRODUCTOS - DELETE: Eliminar producto de la base de datos\n\n"
        "[... Se ejecutan los 5 controladores ...]\n\n"
        "================================================================\n"
        " 🏆 RESULTADOS: 25 de 25 PRUEBAS CRUD EXITOSAS (100%)\n"
        "================================================================"
    )
    
    add_styled_heading(doc, "5.2 Comandos Copy-Paste con curl.exe (CMD, Git Bash o Terminal)", level=2)
    
    add_paragraph(doc, "Diagnóstico de Base de Datos y Dominio:", bold_prefix="Paso 0: ")
    add_code_block(doc, 'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/db/status"')
    
    add_paragraph(doc, "CRUD 1: Productos (/api/productos)", bold_prefix="Paso 1: ")
    add_code_block(doc, 
        '# [CREATE] Crear Pizza\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/productos" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"nombre\\":\\"Pizza Trufada Especial\\",\\"descripcion\\":\\"Queso fior di latte con trufa negra\\",\\"categoriaId\\":1,\\"precioBase\\":22.50,\\"tamanoPredeterminadoId\\":3,\\"activo\\":true}"\n\n'
        '# [READ ALL] Listar Catálogo\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/productos"\n\n'
        '# [READ ONE] Consultar Pizza ID 1\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/productos/1"\n\n'
        '# [UPDATE] Actualizar Precio\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/productos/1" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"nombre\\":\\"Pizza Margherita Clásica D.O.P.\\",\\"precioBase\\":16.50,\\"activo\\":true}"\n\n'
        '# [DELETE] Eliminar Pizza ID 3\n'
        'curl.exe -i -X DELETE "http://api.pizzabyte.local:8080/api/productos/3"'
    )
    
    add_paragraph(doc, "CRUD 2: Ingredientes (/api/ingredientes)", bold_prefix="Paso 2: ")
    add_code_block(doc, 
        '# [CREATE] Crear Ingrediente\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/ingredientes" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"codigo\\":\\"ALB_FRESCA\\",\\"nombre\\":\\"Albahaca Genovesa Fresca\\",\\"categoria\\":\\"VEGETAL\\",\\"esAlergeno\\":false,\\"stockActual\\":45.00,\\"unidadMedida\\":\\"GR\\",\\"costoPorcion\\":0.75}"\n\n'
        '# [READ ALL] Listar Ingredientes\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/ingredientes"\n\n'
        '# [UPDATE] Actualizar Stock ID 1\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/ingredientes/1" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"nombre\\":\\"Masa Madre Tradicional 48h\\",\\"stockActual\\":120.00,\\"costoPorcion\\":1.20}"'
    )
    
    add_paragraph(doc, "CRUD 3: Cupones (/api/cupones)", bold_prefix="Paso 3: ")
    add_code_block(doc, 
        '# [CREATE] Crear Cupón Promocional\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/cupones" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"codigo\\":\\"EXAMEN100\\",\\"tipoDescuento\\":\\"PORCENTAJE\\",\\"valorDescuento\\":30.00,\\"montoMinimoPedido\\":20.00,\\"usosMaximos\\":50,\\"activo\\":true}"\n\n'
        '# [READ ALL] Listar Cupones\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/cupones"\n\n'
        '# [UPDATE] Modificar Cupón ID 1\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/cupones/1" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"codigo\\":\\"PIZZABYTE20\\",\\"tipoDescuento\\":\\"PORCENTAJE\\",\\"valorDescuento\\":20.00,\\"activo\\":true}"'
    )
    
    add_paragraph(doc, "CRUD 4: Pedidos (/api/pedidos)", bold_prefix="Paso 4: ")
    add_code_block(doc, 
        '# [CREATE] Crear Comanda\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/pedidos" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"folioComanda\\":\\"PB-PRUEBA-99\\",\\"clienteId\\":2,\\"origenPedido\\":\\"WEB\\",\\"tipoEntrega\\":\\"A_DOMICILIO\\",\\"direccionId\\":1,\\"notasCocina\\":\\"Masa extra crujiente\\",\\"estadoId\\":1,\\"costoEnvio\\":2.50}"\n\n'
        '# [READ ALL] Listar Comandas\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/pedidos"\n\n'
        '# [UPDATE] Transicionar Estado ID 1 a EN_HORNO\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/pedidos/1" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"estadoId\\":3,\\"notasCocina\\":\\"En horno de leña listo para empaque\\"}"'
    )
    
    add_paragraph(doc, "CRUD 5: Usuarios (/api/usuarios)", bold_prefix="Paso 5: ")
    add_code_block(doc, 
        '# [CREATE] Crear Usuario\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/usuarios" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"username\\":\\"carlos_pizzalover\\",\\"email\\":\\"carlos@pizzabyte.local\\",\\"passwordHash\\":\\"hash_sha256_demo\\",\\"nombreCompleto\\":\\"Carlos Mendoza\\",\\"telefono\\":\\"5559876543\\",\\"rolId\\":2,\\"activo\\":true}"\n\n'
        '# [READ ALL] Listar Usuarios\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/usuarios"\n\n'
        '# [UPDATE] Modificar Usuario ID 2\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/usuarios/2" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"nombreCompleto\\":\\"Brandon Oliver (Cliente Frecuente)\\",\\"telefono\\":\\"5559998877\\"}"'
    )
    
    add_paragraph(doc, "Módulo de Derechos ARCO (/api/arco)", bold_prefix="Paso 6: ")
    add_code_block(doc, 
        '# [ACCESO] Obtener Expediente y Generar Folio\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/arco/usuarios/2/acceso?motivo=Auditoria+Academica"\n\n'
        '# [RECTIFICACIÓN] Corregir Datos Personales\n'
        'curl.exe -i -X PUT "http://api.pizzabyte.local:8080/api/arco/usuarios/2/rectificacion" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"nombreCompleto\\":\\"Brandon Oliver Actualizado\\",\\"telefono\\":\\"5554321098\\",\\"motivo\\":\\"Actualizacion de telefono\\"}"\n\n'
        '# [CANCELACIÓN] Bloqueo Legal de Cuenta\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/arco/usuarios/2/cancelacion" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"motivo\\":\\"Solicitud formal de cancelacion y cese de uso de datos\\"}"\n\n'
        '# [OPOSICIÓN] Revocar Mercadotecnia y Publicidad\n'
        'curl.exe -i -X POST "http://api.pizzabyte.local:8080/api/arco/usuarios/2/oposicion" ^\n'
        '  -H "Content-Type: application/json" ^\n'
        '  -d "{\\"motivo\\":\\"Deseo no recibir publicidad ni promociones\\"}"\n\n'
        '# [HISTORIAL] Consultar Auditoría de Solicitudes ARCO\n'
        'curl.exe -i -X GET "http://api.pizzabyte.local:8080/api/arco/solicitudes"'
    )
    
    add_styled_heading(doc, "5.3 Comandos Nativos de PowerShell (Invoke-RestMethod)", level=2)
    add_paragraph(doc, "Para obtener resultados formateados directamente como objetos de PowerShell:")
    add_code_block(doc, 
        '# 1. Diagnóstico\n'
        'Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/db/status" -Method GET | Format-List\n\n'
        '# 2. Catálogo de Pizzas en tabla limpia\n'
        'Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/productos" -Method GET | Format-Table id, nombre, precioBase, activo\n\n'
        '# 3. Consultar Expediente ARCO en formato JSON jerárquico\n'
        '$exp = Invoke-RestMethod -Uri "http://api.pizzabyte.local:8080/api/arco/usuarios/2/acceso" -Method GET\n'
        '$exp | ConvertTo-Json -Depth 5'
    )
    
    doc.add_page_break()
    
    # ----------------------------------------------------
    # SECCIÓN 6: MATRIZ DE EVALUACIÓN
    # ----------------------------------------------------
    add_styled_heading(doc, "6. MATRIZ DE EVALUACIÓN Y CHECKLIST DOCENTE", level=1)
    
    add_paragraph(doc, 
        "Esta tabla resume los 4 puntos evaluados, la evidencia técnica directa que respalda el cumplimiento y la acción exacta para demostrárselo al profesor o jurado evaluador:"
    )
    
    matrix_headers = ["Criterio Evaluado", "¿Cumple?", "Evidencia Técnica", "Cómo Demostrarlo en Vivo"]
    matrix_data = [
        [
            "1. Levantamiento de Dominio\n(Sustituir IP y puerto)",
            "✅ SÍ (100%)",
            "• server.address=0.0.0.0 en application.properties.\n• Mapeo en C:\\Windows\\System32\\drivers\\etc\\hosts.\n• Regla PortProxy 80->8080 opcional.",
            "1. Abrir navegador en http://api.pizzabyte.local:8080/api/db/status.\n2. Mostrar el archivo hosts con la línea 127.0.0.1 api.pizzabyte.local."
        ],
        [
            "2. Mínimo 5 Controladores CRUD\n(Conectados a PostgreSQL)",
            "✅ SÍ (100%)",
            "• 5 controladores principales (Productos, Ingredientes, Cupones, Pedidos, Usuarios).\n• 5 operaciones completas (Create, Read All, Read One, Update, Delete) con JPA.",
            "1. Ejecutar en terminal: node test_crud_controllers.js (muestra 25/25 pruebas exitosas).\n2. Mostrar en Postman o con curl.exe la creación, edición y borrado."
        ],
        [
            "3. Derechos ARCO\n(Acceso, Rectificación, Cancelación, Oposición)",
            "✅ SÍ (100%)",
            "• ArcoController.java (/api/arco).\n• Tabla solicitudes_arco con folio único.\n• Columnas acepta_marketing y bloqueado_arco en usuarios.\n• Fundamento LFPDPPP.",
            "1. Ejecutar GET /api/arco/usuarios/2/acceso (muestra expediente y folio).\n2. Ejecutar POST /api/arco/usuarios/2/cancelacion (bloquea cuenta en DB).\n3. Consultar tabla en pgAdmin o /api/arco/solicitudes."
        ],
        [
            "4. Manual de Postman y Plan B\n(Instrucciones y comandos terminal)",
            "✅ SÍ (100%)",
            "• PizzaByte_API_Postman_Collection.json importable.\n• Este documento Word (.docx) formal.\n• Comandos curl.exe y PowerShell listos.",
            "1. Abrir Postman y mostrar la colección con las 7 carpetas.\n2. Si el profesor pide consola, usar los comandos de la Sección 5."
        ]
    ]
    add_styled_table(doc, matrix_headers, matrix_data, col_widths=[1.5, 0.9, 2.2, 2.4])
    
    add_callout(doc, "MENSAJE FINAL PARA EL DÍA DE LA EVALUACIÓN",
        "El proyecto PizzaByte cumple de manera sobresaliente y rigurosa con los más altos estándares de ingeniería de software, arquitectura limpia, seguridad jurídica en privacidad de datos y contingencia operativa ante fallos de entorno.\n\n"
        "¡Mucho éxito en tu presentación académica!",
        box_type="TIP"
    )
    
    # Save document in workspace and artifacts
    output_path_workspace = os.path.abspath("Manual_Evaluacion_PizzaByte_API_y_ARCO.docx")
    doc.save(output_path_workspace)
    print(f"Documento guardado con éxito en: {output_path_workspace}")
    
    # Copy to artifacts directory if exists
    artifacts_dir = r"C:\Users\brand\.gemini\antigravity\brain\cc180582-6c28-4b96-8520-b6453e5cc644"
    if os.path.exists(artifacts_dir):
        output_path_artifacts = os.path.join(artifacts_dir, "Manual_Evaluacion_PizzaByte_API_y_ARCO.docx")
        doc.save(output_path_artifacts)
        print(f"Documento copiado al directorio de artefactos: {output_path_artifacts}")

if __name__ == "__main__":
    generate_document()
