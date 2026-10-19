package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Categoria;
import com.pizzabyte.backend.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // 1. READ ALL (Listar todas las categorías)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Categoria> lista = categoriaRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (Obtener categoría por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return categoriaRepository.findById(id).map(cat -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", cat);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Categoría #" + id + " no encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE (Crear nueva categoría)
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El nombre de la categoría es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }

        if (categoriaRepository.findByNombreIgnoreCase(categoria.getNombre().trim()).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ya existe una categoría con el nombre '" + categoria.getNombre() + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        if (categoria.getActivo() == null) {
            categoria.setActivo(true);
        }

        Categoria nueva = categoriaRepository.save(categoria);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Categoría registrada exitosamente");
        resp.put("data", nueva);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Actualizar categoría)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Categoria datos) {
        return categoriaRepository.findById(id).map(cat -> {
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                String nuevoNombre = datos.getNombre().trim();
                if (!nuevoNombre.equalsIgnoreCase(cat.getNombre()) &&
                    categoriaRepository.findByNombreIgnoreCase(nuevoNombre).isPresent()) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("mensaje", "Ya existe otra categoría con el nombre '" + nuevoNombre + "'");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
                }
                cat.setNombre(nuevoNombre);
            }
            if (datos.getDescripcion() != null) {
                cat.setDescripcion(datos.getDescripcion());
            }
            if (datos.getActivo() != null) {
                cat.setActivo(datos.getActivo());
            }

            Categoria actualizada = categoriaRepository.save(cat);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Categoría #" + id + " actualizada exitosamente");
            resp.put("data", actualizada);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Categoría #" + id + " no encontrada para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE (Eliminar categoría)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return categoriaRepository.findById(id).map(cat -> {
            try {
                categoriaRepository.delete(cat);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("mensaje", "Categoría #" + id + " (" + cat.getNombre() + ") eliminada exitosamente");
                Map<String, Object> d = new HashMap<>();
                d.put("id", cat.getId());
                d.put("nombre", cat.getNombre());
                resp.put("data", d);
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("mensaje", "No se puede eliminar la categoría #" + id + " porque tiene productos asociados");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Categoría #" + id + " no encontrada para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
