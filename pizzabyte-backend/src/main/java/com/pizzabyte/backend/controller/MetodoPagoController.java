package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.MetodoPago;
import com.pizzabyte.backend.repository.MetodoPagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metodos-pago")
@CrossOrigin(origins = "http://localhost:4200")
public class MetodoPagoController {

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    // 1. READ ALL (Listar todos los métodos de pago)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<MetodoPago> lista = metodoPagoRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (Obtener método de pago por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return metodoPagoRepository.findById(id).map(metodo -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", metodo);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Método de pago #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE (Crear nuevo método de pago)
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody MetodoPago metodoPago) {
        if (metodoPago.getCodigo() == null || metodoPago.getCodigo().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El código del método de pago es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }
        if (metodoPago.getNombre() == null || metodoPago.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El nombre del método de pago es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }

        String codigoUpper = metodoPago.getCodigo().trim().toUpperCase();
        metodoPago.setCodigo(codigoUpper);
        if (metodoPagoRepository.findByCodigoIgnoreCase(codigoUpper).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ya existe un método de pago con el código '" + codigoUpper + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        if (metodoPago.getActivo() == null) {
            metodoPago.setActivo(true);
        }

        MetodoPago nuevo = metodoPagoRepository.save(metodoPago);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Método de pago registrado exitosamente");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Actualizar método de pago)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody MetodoPago datos) {
        return metodoPagoRepository.findById(id).map(metodo -> {
            if (datos.getCodigo() != null && !datos.getCodigo().isBlank()) {
                String nuevoCodigo = datos.getCodigo().trim().toUpperCase();
                if (!nuevoCodigo.equalsIgnoreCase(metodo.getCodigo()) &&
                    metodoPagoRepository.findByCodigoIgnoreCase(nuevoCodigo).isPresent()) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("mensaje", "El código '" + nuevoCodigo + "' ya está registrado en otro método de pago");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
                }
                metodo.setCodigo(nuevoCodigo);
            }
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                metodo.setNombre(datos.getNombre().trim());
            }
            if (datos.getActivo() != null) {
                metodo.setActivo(datos.getActivo());
            }

            MetodoPago actualizado = metodoPagoRepository.save(metodo);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Método de pago #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Método de pago #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE (Eliminar método de pago)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return metodoPagoRepository.findById(id).map(metodo -> {
            try {
                metodoPagoRepository.delete(metodo);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("mensaje", "Método de pago #" + id + " (" + metodo.getNombre() + ") eliminado exitosamente");
                Map<String, Object> d = new HashMap<>();
                d.put("id", metodo.getId());
                d.put("codigo", metodo.getCodigo());
                resp.put("data", d);
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("mensaje", "No se puede eliminar el método de pago #" + id + " porque tiene transacciones asociadas");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Método de pago #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
