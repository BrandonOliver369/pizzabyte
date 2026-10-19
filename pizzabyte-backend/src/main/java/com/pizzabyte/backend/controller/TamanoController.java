package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Tamano;
import com.pizzabyte.backend.repository.TamanoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tamanos")
@CrossOrigin(origins = "http://localhost:4200")
public class TamanoController {

    @Autowired
    private TamanoRepository tamanoRepository;

    // 1. READ ALL (Listar todos los tamaños de pizza)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Tamano> lista = tamanoRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (Obtener tamaño por ID)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Integer id) {
        return tamanoRepository.findById(id).map(tam -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", tam);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Tamaño #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE (Crear nuevo tamaño)
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Tamano tamano) {
        if (tamano.getCodigo() == null || tamano.getCodigo().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El código del tamaño es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }
        if (tamano.getNombre() == null || tamano.getNombre().isBlank()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El nombre del tamaño es obligatorio");
            return ResponseEntity.badRequest().body(err);
        }
        if (tamano.getPorciones() == null || tamano.getPorciones() <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Las porciones deben ser un número entero mayor a 0");
            return ResponseEntity.badRequest().body(err);
        }
        if (tamano.getDiametroCm() == null || tamano.getDiametroCm() <= 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "El diámetro en cm debe ser mayor a 0");
            return ResponseEntity.badRequest().body(err);
        }
        if (tamano.getMultiplicadorPrecio() == null || tamano.getMultiplicadorPrecio().compareTo(BigDecimal.ZERO) <= 0) {
            tamano.setMultiplicadorPrecio(BigDecimal.valueOf(1.00));
        }

        String codigoUpper = tamano.getCodigo().trim().toUpperCase();
        tamano.setCodigo(codigoUpper);
        if (tamanoRepository.findByCodigoIgnoreCase(codigoUpper).isPresent()) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Ya existe un tamaño registrado con el código '" + codigoUpper + "'");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        Tamano nuevo = tamanoRepository.save(tamano);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Tamaño registrado exitosamente");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Actualizar tamaño)
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody Tamano datos) {
        return tamanoRepository.findById(id).map(tam -> {
            if (datos.getCodigo() != null && !datos.getCodigo().isBlank()) {
                String nuevoCodigo = datos.getCodigo().trim().toUpperCase();
                if (!nuevoCodigo.equalsIgnoreCase(tam.getCodigo()) &&
                    tamanoRepository.findByCodigoIgnoreCase(nuevoCodigo).isPresent()) {
                    Map<String, Object> err = new HashMap<>();
                    err.put("success", false);
                    err.put("mensaje", "El código '" + nuevoCodigo + "' ya está registrado en otro tamaño");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
                }
                tam.setCodigo(nuevoCodigo);
            }
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                tam.setNombre(datos.getNombre().trim());
            }
            if (datos.getMultiplicadorPrecio() != null && datos.getMultiplicadorPrecio().compareTo(BigDecimal.ZERO) > 0) {
                tam.setMultiplicadorPrecio(datos.getMultiplicadorPrecio());
            }
            if (datos.getPorciones() != null && datos.getPorciones() > 0) {
                tam.setPorciones(datos.getPorciones());
            }
            if (datos.getDiametroCm() != null && datos.getDiametroCm() > 0) {
                tam.setDiametroCm(datos.getDiametroCm());
            }

            Tamano actualizado = tamanoRepository.save(tam);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Tamaño #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Tamaño #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE (Eliminar tamaño)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return tamanoRepository.findById(id).map(tam -> {
            try {
                tamanoRepository.delete(tam);
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("mensaje", "Tamaño #" + id + " (" + tam.getNombre() + ") eliminado exitosamente");
                Map<String, Object> d = new HashMap<>();
                d.put("id", tam.getId());
                d.put("codigo", tam.getCodigo());
                resp.put("data", d);
                return ResponseEntity.ok(resp);
            } catch (Exception e) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("mensaje", "No se puede eliminar el tamaño #" + id + " porque tiene pedidos asociados");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
            }
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Tamaño #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
