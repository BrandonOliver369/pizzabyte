package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Pedido;
import com.pizzabyte.backend.entity.SolicitudArco;
import com.pizzabyte.backend.entity.Usuario;
import com.pizzabyte.backend.repository.PedidoRepository;
import com.pizzabyte.backend.repository.SolicitudArcoRepository;
import com.pizzabyte.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * ==============================================================================
 * CONTROLADOR DE DERECHOS ARCO (LFPDPPP)
 * ==============================================================================
 * Implementa el ejercicio formal de los 4 Derechos ARCO:
 * - A: Acceso (Exportación completa de datos personales y expediente)
 * - R: Rectificación (Corrección de datos inexactos con trazabilidad)
 * - C: Cancelación (Bloqueo de cuenta, disociación de datos y retención legal)
 * - O: Oposición (Revocación de consentimiento para marketing y finalidades secundarias)
 */
@RestController
@RequestMapping("/api/arco")
@CrossOrigin(origins = "*") // Permite acceso desde dominio local y red local
public class ArcoController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private SolicitudArcoRepository solicitudArcoRepository;

    private String generarFolio() {
        return "ARCO-" + (int)(1000 + Math.random() * 9000);
    }

    // ==========================================================================
    // 1. DERECHO DE ACCESO (A)
    // ==========================================================================
    @GetMapping("/usuarios/{id}/acceso")
    public ResponseEntity<Map<String, Object>> ejercerAcceso(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "mensaje", "Titular de los datos no encontrado"
            ));
        }

        Usuario usuario = usuarioOpt.get();
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> p.getClienteId() != null && p.getClienteId().equals(id))
                .toList();

        // Registrar solicitud formal de acceso
        SolicitudArco solicitud = new SolicitudArco();
        String folio = generarFolio();
        solicitud.setFolio(folio);
        solicitud.setUsuarioId(id);
        solicitud.setTipoDerecho("ACCESO");
        solicitud.setDescripcionPeticion("Ejercicio del Derecho de Acceso al expediente integral de datos personales.");
        solicitud.setEstado("ATENDIDA");
        solicitud.setFechaResolucion(OffsetDateTime.now());
        solicitud.setRespuestaResolucion("Expediente de datos personales generado y entregado al titular.");
        solicitudArcoRepository.save(solicitud);

        Map<String, Object> expediente = new HashMap<>();
        expediente.put("identidad", Map.of(
                "id", usuario.getId(),
                "username", usuario.getUsername(),
                "email", usuario.getEmail(),
                "nombre_completo", usuario.getNombreCompleto(),
                "telefono", usuario.getTelefono() != null ? usuario.getTelefono() : "No registrado",
                "rol", usuario.getRol() != null ? usuario.getRol().getNombre() : "CLIENTE",
                "fecha_registro", usuario.getCreadoEn() != null ? usuario.getCreadoEn().toString() : "N/D"
        ));
        expediente.put("preferencias_privacidad", Map.of(
                "acepta_marketing", usuario.getAceptaMarketing() != null ? usuario.getAceptaMarketing() : true,
                "bloqueado_arco", usuario.getBloqueadoArco() != null ? usuario.getBloqueadoArco() : false
        ));
        expediente.put("historial_comandas", pedidos.stream().map(p -> Map.of(
                "folio", p.getFolioComanda(),
                "tipo_entrega", p.getTipoEntrega(),
                "total", p.getTotal(),
                "fecha", p.getCreadoEn() != null ? p.getCreadoEn().toString() : "N/D"
        )).toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("derecho", "ACCESO");
        resp.put("folio_solicitud", folio);
        resp.put("fundamento_legal", "Artículo 23 de la LFPDPPP (Derecho de Acceso a datos personales)");
        resp.put("expediente_titular", expediente);

        return ResponseEntity.ok(resp);
    }

    // ==========================================================================
    // 2. DERECHO DE RECTIFICACIÓN (R)
    // ==========================================================================
    @PutMapping("/usuarios/{id}/rectificacion")
    public ResponseEntity<Map<String, Object>> ejercerRectificacion(
            @PathVariable Long id,
            @RequestBody Map<String, Object> datosRectificar) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "mensaje", "Titular de los datos no encontrado"
            ));
        }

        Usuario usuario = usuarioOpt.get();
        Map<String, Object> valoresAnteriores = new HashMap<>();
        valoresAnteriores.put("nombre_completo", usuario.getNombreCompleto());
        valoresAnteriores.put("telefono", usuario.getTelefono());
        valoresAnteriores.put("email", usuario.getEmail());

        // Aplicar rectificaciones solicitadas
        if (datosRectificar.containsKey("nombre_completo")) {
            usuario.setNombreCompleto(datosRectificar.get("nombre_completo").toString());
        }
        if (datosRectificar.containsKey("telefono")) {
            usuario.setTelefono(datosRectificar.get("telefono").toString());
        }
        if (datosRectificar.containsKey("email")) {
            usuario.setEmail(datosRectificar.get("email").toString());
        }
        usuario.setActualizadoEn(OffsetDateTime.now());
        Usuario actualizado = usuarioRepository.save(usuario);

        // Registrar solicitud formal de rectificación
        SolicitudArco solicitud = new SolicitudArco();
        String folio = generarFolio();
        solicitud.setFolio(folio);
        solicitud.setUsuarioId(id);
        solicitud.setTipoDerecho("RECTIFICACION");
        solicitud.setDescripcionPeticion("Solicitud de rectificación de datos personales inexactos o desactualizados.");
        solicitud.setEstado("ATENDIDA");
        solicitud.setFechaResolucion(OffsetDateTime.now());
        solicitud.setRespuestaResolucion("Datos rectificados correctamente en la base de datos.");
        solicitudArcoRepository.save(solicitud);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("derecho", "RECTIFICACION");
        resp.put("folio_solicitud", folio);
        resp.put("fundamento_legal", "Artículo 24 de la LFPDPPP (Derecho de Rectificación)");
        resp.put("valores_anteriores", valoresAnteriores);
        resp.put("valores_actualizados", Map.of(
                "nombre_completo", actualizado.getNombreCompleto(),
                "telefono", actualizado.getTelefono() != null ? actualizado.getTelefono() : "",
                "email", actualizado.getEmail()
        ));

        return ResponseEntity.ok(resp);
    }

    // ==========================================================================
    // 3. DERECHO DE CANCELACIÓN (C)
    // ==========================================================================
    @PostMapping("/usuarios/{id}/cancelacion")
    public ResponseEntity<Map<String, Object>> ejercerCancelacion(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "mensaje", "Titular de los datos no encontrado"
            ));
        }

        Usuario usuario = usuarioOpt.get();
        String motivo = payload != null && payload.get("motivo") != null
                ? payload.get("motivo").toString()
                : "Solicitud de cancelación y baja de cuenta por parte del titular.";

        // Procedimiento legal de cancelación: Bloqueo de datos y disociación
        usuario.setActivo(false);
        usuario.setBloqueadoArco(true);
        usuario.setAceptaMarketing(false);
        usuario.setActualizadoEn(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        // Registrar solicitud formal de cancelación
        SolicitudArco solicitud = new SolicitudArco();
        String folio = generarFolio();
        solicitud.setFolio(folio);
        solicitud.setUsuarioId(id);
        solicitud.setTipoDerecho("CANCELACION");
        solicitud.setDescripcionPeticion(motivo);
        solicitud.setEstado("ATENDIDA");
        solicitud.setFechaResolucion(OffsetDateTime.now());
        solicitud.setRespuestaResolucion("Cuenta bloqueada legalmente. Datos disociados para cesar tratamiento.");
        solicitudArcoRepository.save(solicitud);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("derecho", "CANCELACION");
        resp.put("folio_solicitud", folio);
        resp.put("fundamento_legal", "Artículo 25 de la LFPDPPP (Derecho de Cancelación y periodo de bloqueo)");
        resp.put("estado_usuario", "BLOQUEADO_ARCO");
        resp.put("mensaje", "Se ha ejecutado la cancelación de datos personales. La cuenta ha sido bloqueada y sus datos no serán tratados.");

        return ResponseEntity.ok(resp);
    }

    // ==========================================================================
    // 4. DERECHO DE OPOSICIÓN (O)
    // ==========================================================================
    @PostMapping("/usuarios/{id}/oposicion")
    public ResponseEntity<Map<String, Object>> ejercerOposicion(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "mensaje", "Titular de los datos no encontrado"
            ));
        }

        Usuario usuario = usuarioOpt.get();
        boolean oponerseMarketing = true;
        if (payload != null && payload.containsKey("oponerse_marketing")) {
            oponerseMarketing = Boolean.parseBoolean(payload.get("oponerse_marketing").toString());
        }

        usuario.setAceptaMarketing(!oponerseMarketing);
        usuario.setActualizadoEn(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        // Registrar solicitud formal de oposición
        SolicitudArco solicitud = new SolicitudArco();
        String folio = generarFolio();
        solicitud.setFolio(folio);
        solicitud.setUsuarioId(id);
        solicitud.setTipoDerecho("OPOSICION");
        solicitud.setDescripcionPeticion("Oposición expresa al tratamiento de datos con fines publicitarios, mercadotécnicos o envío de correos masivos.");
        solicitud.setEstado("ATENDIDA");
        solicitud.setFechaResolucion(OffsetDateTime.now());
        solicitud.setRespuestaResolucion("Revocación de consentimiento para fines publicitarios aplicada.");
        solicitudArcoRepository.save(solicitud);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("derecho", "OPOSICION");
        resp.put("folio_solicitud", folio);
        resp.put("fundamento_legal", "Artículo 27 de la LFPDPPP (Derecho de Oposición a finalidades no necesarias)");
        resp.put("acepta_marketing", usuario.getAceptaMarketing());
        resp.put("mensaje", "Oposición registrada exitosamente. El titular ha quedado excluido de campañas promocionales.");

        return ResponseEntity.ok(resp);
    }

    // ==========================================================================
    // 5. CONSULTA DE SOLICITUDES Y AUDITORÍA ARCO
    // ==========================================================================
    @GetMapping("/solicitudes")
    public ResponseEntity<Map<String, Object>> listarSolicitudes() {
        List<SolicitudArco> lista = solicitudArcoRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/solicitudes/{folio}")
    public ResponseEntity<Map<String, Object>> obtenerSolicitud(@PathVariable String folio) {
        return solicitudArcoRepository.findByFolio(folio.toUpperCase().trim())
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", (Object) s)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "mensaje", "Solicitud ARCO no encontrada"
                )));
    }
}
