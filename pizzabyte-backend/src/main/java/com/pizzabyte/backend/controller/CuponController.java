package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.CuponDescuento;
import com.pizzabyte.backend.repository.CuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cupones")
@CrossOrigin(origins = "http://localhost:4200")
public class CuponController {

    @Autowired
    private CuponRepository cuponRepository;

    // 1. READ ALL
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<CuponDescuento> lista = cuponRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE (por código alfanumérico o por ID)
    @GetMapping("/{identificador}")
    public ResponseEntity<Map<String, Object>> obtenerPorIdOCodigo(@PathVariable String identificador) {
        Optional<CuponDescuento> cuponOpt;
        try {
            Integer id = Integer.parseInt(identificador);
            cuponOpt = cuponRepository.findById(id);
        } catch (NumberFormatException e) {
            cuponOpt = cuponRepository.findByCodigoIgnoreCase(identificador);
        }

        return cuponOpt.map(cupon -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", cupon);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Cupón '" + identificador + "' no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody CuponDescuento cupon) {
        if (cupon.getCodigo() == null || cupon.getPorcentajeDescuento() == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "codigo y porcentaje_descuento son obligatorios");
            return ResponseEntity.badRequest().body(err);
        }

        cupon.setCodigo(cupon.getCodigo().toUpperCase().trim());
        CuponDescuento nuevo = cuponRepository.save(cupon);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Cupón creado exitosamente en PostgreSQL");
        resp.put("data", nuevo);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Integer id, @RequestBody CuponDescuento datos) {
        return cuponRepository.findById(id).map(c -> {
            if (datos.getCodigo() != null) c.setCodigo(datos.getCodigo());
            if (datos.getPorcentajeDescuento() != null) c.setPorcentajeDescuento(datos.getPorcentajeDescuento());
            if (datos.getMontoMinimoCompra() != null) c.setMontoMinimoCompra(datos.getMontoMinimoCompra());
            if (datos.getUsosMaximos() != null) c.setUsosMaximos(datos.getUsosMaximos());
            if (datos.getActivo() != null) c.setActivo(datos.getActivo());
            if (datos.getFechaExpiracion() != null) c.setFechaExpiracion(datos.getFechaExpiracion());

            CuponDescuento actualizado = cuponRepository.save(c);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Cupón #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Cupón #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Integer id) {
        return cuponRepository.findById(id).map(c -> {
            cuponRepository.delete(c);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Cupón #" + id + " (" + c.getCodigo() + ") eliminado de la base de datos");
            Map<String, Object> d = new HashMap<>();
            d.put("id", c.getId());
            d.put("codigo", c.getCodigo());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Cupón #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
