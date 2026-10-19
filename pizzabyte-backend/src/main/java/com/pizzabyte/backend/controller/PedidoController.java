package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Pedido;
import com.pizzabyte.backend.repository.EstadoPedidoRepository;
import com.pizzabyte.backend.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:4200")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private EstadoPedidoRepository estadoPedidoRepository;

    // 1. READ ALL (Consola KDS de Cocina)
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Pedido> lista = pedidoRepository.findAllByOrderByCreadoEnDesc();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Long id) {
        return pedidoRepository.findById(id).map(pedido -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            Map<String, Object> d = new HashMap<>();
            d.put("id", pedido.getId());
            d.put("folio_comanda", pedido.getFolioComanda());
            d.put("estado_id", pedido.getEstadoId());
            d.put("cliente_id", pedido.getClienteId());
            d.put("total", pedido.getTotal());
            d.put("detalles", List.of(Map.of("producto_nombre", "Margherita", "cantidad", 1)));
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Pedido #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Map<String, Object> body) {
        Pedido pedido = new Pedido();
        String folio = "PB-" + (int)(1000 + Math.random() * 9000);
        pedido.setFolioComanda(folio);

        if (body.get("cliente_id") != null) {
            pedido.setClienteId(Long.valueOf(body.get("cliente_id").toString()));
        }
        if (body.get("origen_pedido") != null) {
            pedido.setOrigenPedido(body.get("origen_pedido").toString());
        }
        if (body.get("tipo_entrega") != null) {
            pedido.setTipoEntrega(body.get("tipo_entrega").toString());
        }
        if (body.get("notas_cocina") != null) {
            pedido.setNotasCocina(body.get("notas_cocina").toString());
        }

        String estadoCodigo = body.get("estado_codigo") != null ? body.get("estado_codigo").toString() : "CONFIRMADO";
        estadoPedidoRepository.findByCodigoIgnoreCase(estadoCodigo).ifPresentOrElse(
                e -> pedido.setEstadoId(e.getId()),
                () -> pedido.setEstadoId(2)
        );

        Pedido nuevo = pedidoRepository.save(pedido);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Pedido #" + nuevo.getId() + " (" + folio + ") registrado exitosamente en PostgreSQL");
        Map<String, Object> d = new HashMap<>();
        d.put("pedido", nuevo);
        d.put("detalles", List.of(Map.of("id", 1, "cantidad", 1)));
        resp.put("data", d);

        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE (Transición de estado en cocina KDS o notas)
    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return pedidoRepository.findById(id).map(pedido -> {
            if (body.containsKey("estado_codigo")) {
                String codigo = body.get("estado_codigo").toString();
                estadoPedidoRepository.findByCodigoIgnoreCase(codigo).ifPresent(e -> pedido.setEstadoId(e.getId()));
            } else if (body.containsKey("estado_id")) {
                pedido.setEstadoId(Integer.valueOf(body.get("estado_id").toString()));
            }

            if (body.containsKey("notas_cocina")) {
                pedido.setNotasCocina(body.get("notas_cocina").toString());
            }

            Pedido actualizado = pedidoRepository.save(pedido);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Pedido #" + id + " actualizado exitosamente");
            Map<String, Object> d = new HashMap<>();
            d.put("id", actualizado.getId());
            d.put("folio_comanda", actualizado.getFolioComanda());
            d.put("estado_id", actualizado.getEstadoId());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Pedido #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedidoRepository.delete(pedido);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Pedido #" + id + " (" + pedido.getFolioComanda() + ") eliminado exitosamente de la base de datos");
            Map<String, Object> d = new HashMap<>();
            d.put("id", pedido.getId());
            d.put("folio_comanda", pedido.getFolioComanda());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Pedido #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
