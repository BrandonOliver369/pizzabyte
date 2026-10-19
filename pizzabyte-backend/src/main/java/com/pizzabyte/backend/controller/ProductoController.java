package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Producto;
import com.pizzabyte.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // 1. READ ALL
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Producto> lista = productoRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return productoRepository.findById(id).map(prod -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", prod);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Producto #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Producto producto) {
        if (producto.getNombre() == null || producto.getPrecioBase() == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "nombre y precio_base son obligatorios");
            return ResponseEntity.badRequest().body(err);
        }
        if (producto.getCategoriaId() == null) {
            producto.setCategoriaId(1);
        }
        Producto nuevo = productoRepository.save(producto);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Producto creado exitosamente en PostgreSQL");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Producto datos) {
        return productoRepository.findById(id).map(prod -> {
            if (datos.getNombre() != null) prod.setNombre(datos.getNombre());
            if (datos.getDescripcion() != null) prod.setDescripcion(datos.getDescripcion());
            if (datos.getPrecioBase() != null) prod.setPrecioBase(datos.getPrecioBase());
            if (datos.getImagenUrl() != null) prod.setImagenUrl(datos.getImagenUrl());
            if (datos.getDisponible() != null) prod.setDisponible(datos.getDisponible());
            if (datos.getCategoriaId() != null) prod.setCategoriaId(datos.getCategoriaId());

            Producto actualizado = productoRepository.save(prod);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Producto #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Producto #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return productoRepository.findById(id).map(prod -> {
            productoRepository.delete(prod);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Producto #" + id + " (" + prod.getNombre() + ") eliminado exitosamente");
            Map<String, Object> d = new HashMap<>();
            d.put("id", prod.getId());
            d.put("nombre", prod.getNombre());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Producto #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
