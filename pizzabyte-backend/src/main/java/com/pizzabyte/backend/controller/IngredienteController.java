package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Ingrediente;
import com.pizzabyte.backend.repository.IngredienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingredientes")
@CrossOrigin(origins = "http://localhost:4200")
public class IngredienteController {

    @Autowired
    private IngredienteRepository ingredienteRepository;

    // 1. READ ALL
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Ingrediente> lista = ingredienteRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return ingredienteRepository.findById(id).map(ing -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", ing);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ingrediente #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Ingrediente ingrediente) {
        if (ingrediente.getNombre() == null || ingrediente.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El campo nombre es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }

        Ingrediente nuevo = ingredienteRepository.save(ingrediente);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Ingrediente registrado exitosamente en PostgreSQL");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Ingrediente datos) {
        return ingredienteRepository.findById(id).map(ing -> {
            if (datos.getNombre() != null) ing.setNombre(datos.getNombre());
            if (datos.getCostoExtra() != null) ing.setCostoExtra(datos.getCostoExtra());
            if (datos.getStockDisponible() != null) ing.setStockDisponible(datos.getStockDisponible());
            if (datos.getUnidadMedida() != null) ing.setUnidadMedida(datos.getUnidadMedida());

            Ingrediente actualizado = ingredienteRepository.save(ing);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Ingrediente #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ingrediente #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return ingredienteRepository.findById(id).map(ing -> {
            ingredienteRepository.delete(ing);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Ingrediente #" + id + " (" + ing.getNombre() + ") eliminado exitosamente de la base de datos");
            Map<String, Object> d = new HashMap<>();
            d.put("id", ing.getId());
            d.put("nombre", ing.getNombre());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ingrediente #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
