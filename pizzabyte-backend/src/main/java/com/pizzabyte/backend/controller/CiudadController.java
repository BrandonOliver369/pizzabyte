package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Ciudad;
import com.pizzabyte.backend.repository.CiudadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ciudades")
@CrossOrigin(origins = "http://localhost:4200")
public class CiudadController {

    @Autowired
    private CiudadRepository ciudadRepository;

    // 1. READ ALL (Listar todas las ciudades)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Ciudad> lista = ciudadRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (Obtener ciudad por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return ciudadRepository.findById(id).map(ciudad -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", ciudad);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ciudad #" + id + " no encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE (Crear nueva ciudad)
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Ciudad ciudad) {
        if (ciudad.getNombre() == null || ciudad.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El nombre de la ciudad es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }

        String nombreLimpio = ciudad.getNombre().trim();
        ciudad.setNombre(nombreLimpio);
        if (ciudadRepository.findByNombreIgnoreCase(nombreLimpio).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ya existe una ciudad registrada con el nombre '" + nombreLimpio + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        Ciudad nueva = ciudadRepository.save(ciudad);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Ciudad registrada exitosamente");
        resp.put("data", nueva);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Actualizar ciudad)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Ciudad datos) {
        return ciudadRepository.findById(id).map(ciudad -> {
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                String nuevoNombre = datos.getNombre().trim();
                if (!nuevoNombre.equalsIgnoreCase(ciudad.getNombre()) &&
                    ciudadRepository.findByNombreIgnoreCase(nuevoNombre).isPresent()) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("mensaje", "El nombre '" + nuevoNombre + "' ya está registrado en otra ciudad");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
                }
                ciudad.setNombre(nuevoNombre);
            }

            Ciudad actualizada = ciudadRepository.save(ciudad);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Ciudad #" + id + " actualizada exitosamente");
            resp.put("data", actualizada);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ciudad #" + id + " no encontrada para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE (Eliminar ciudad)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return ciudadRepository.findById(id).map(ciudad -> {
            try {
                ciudadRepository.delete(ciudad);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("mensaje", "Ciudad #" + id + " (" + ciudad.getNombre() + ") eliminada exitosamente");
                Map<String, Object> d = new HashMap<>();
                d.put("id", ciudad.getId());
                d.put("nombre", ciudad.getNombre());
                resp.put("data", d);
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("mensaje", "No se puede eliminar la ciudad #" + id + " porque tiene colonias o direcciones asociadas");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ciudad #" + id + " no encontrada para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
