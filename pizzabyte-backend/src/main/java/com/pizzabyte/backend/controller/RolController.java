package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Rol;
import com.pizzabyte.backend.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:4200")
public class RolController {

    @Autowired
    private RolRepository rolRepository;

    // 1. READ ALL (Listar todos los roles)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Rol> lista = rolRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (Obtener rol por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return rolRepository.findById(id).map(rol -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", rol);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Rol #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE (Crear nuevo rol)
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Rol rol) {
        if (rol.getCodigo() == null || rol.getCodigo().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El código del rol es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }
        if (rol.getNombre() == null || rol.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El nombre del rol es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }

        rol.setCodigo(rol.getCodigo().trim().toUpperCase());
        if (rolRepository.findByCodigoIgnoreCase(rol.getCodigo()).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ya existe un rol con el código '" + rol.getCodigo() + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        Rol nuevo = rolRepository.save(rol);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Rol registrado exitosamente en la base de datos");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Actualizar rol existente)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Rol datos) {
        return rolRepository.findById(id).map(rol -> {
            if (datos.getCodigo() != null && !datos.getCodigo().isBlank()) {
                String nuevoCodigo = datos.getCodigo().trim().toUpperCase();
                // Validar duplicado si cambia el código
                if (!nuevoCodigo.equalsIgnoreCase(rol.getCodigo()) &&
                    rolRepository.findByCodigoIgnoreCase(nuevoCodigo).isPresent()) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("mensaje", "El código '" + nuevoCodigo + "' ya está en uso por otro rol");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
                }
                rol.setCodigo(nuevoCodigo);
            }
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                rol.setNombre(datos.getNombre());
            }
            if (datos.getDescripcion() != null) {
                rol.setDescripcion(datos.getDescripcion());
            }

            Rol actualizado = rolRepository.save(rol);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Rol #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Rol #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE (Eliminar rol)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return rolRepository.findById(id).map(rol -> {
            try {
                rolRepository.delete(rol);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("mensaje", "Rol #" + id + " (" + rol.getNombre() + ") eliminado exitosamente");
                Map<String, Object> d = new HashMap<>();
                d.put("id", rol.getId());
                d.put("codigo", rol.getCodigo());
                resp.put("data", d);
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("mensaje", "No se puede eliminar el rol #" + id + " porque tiene usuarios asociados");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Rol #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
