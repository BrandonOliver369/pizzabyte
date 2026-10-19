package com.pizzabyte.backend.controller;

import com.pizzabyte.backend.entity.Usuario;
import com.pizzabyte.backend.repository.RolRepository;
import com.pizzabyte.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:4200")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    // Helper SHA-256
    private String sha256(String texto) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(texto.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculando hash SHA-256", e);
        }
    }

    // 1. READ ALL
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        List<Usuario> lista = usuarioRepository.findAll();
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("total", lista.size());
        resp.put("data", lista);
        return ResponseEntity.ok(resp);
    }

    // 2. READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(u -> {
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", u);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Usuario #" + id + " no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 3. CREATE
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Map<String, Object> body) {
        String username = body.get("username") != null ? body.get("username").toString().toLowerCase().trim() : null;
        String email = body.get("email") != null ? body.get("email").toString().toLowerCase().trim() : null;
        String password = body.get("password") != null ? body.get("password").toString() : null;

        if (username == null || email == null || password == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "username, email y password son obligatorios");
            return ResponseEntity.badRequest().body(err);
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setPasswordHash(sha256(password));
        usuario.setNombreCompleto(body.get("nombre_completo") != null ? body.get("nombre_completo").toString() : username);
        usuario.setTelefono(body.get("telefono") != null ? body.get("telefono").toString() : null);

        String rolCodigo = body.get("rol_codigo") != null ? body.get("rol_codigo").toString() : "CLIENTE";
        rolRepository.findByCodigoIgnoreCase(rolCodigo).ifPresentOrElse(
                r -> usuario.setRolId(r.getId()),
                () -> usuario.setRolId(2)
        );

        Usuario nuevo = usuarioRepository.save(usuario);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("mensaje", "Usuario registrado exitosamente en PostgreSQL");
        resp.put("data", nuevo);

        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    // 4. UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return usuarioRepository.findById(id).map(u -> {
            if (body.containsKey("nombre_completo")) u.setNombreCompleto(body.get("nombre_completo").toString());
            if (body.containsKey("telefono")) u.setTelefono(body.get("telefono").toString());
            if (body.containsKey("activo")) u.setActivo(Boolean.parseBoolean(body.get("activo").toString()));
            if (body.containsKey("password") && body.get("password") != null) {
                u.setPasswordHash(sha256(body.get("password").toString()));
            }

            Usuario actualizado = usuarioRepository.save(u);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Usuario #" + id + " actualizado exitosamente");
            resp.put("data", actualizado);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Usuario #" + id + " no encontrado para actualizar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }

    // 5. DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(u -> {
            usuarioRepository.delete(u);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("mensaje", "Usuario #" + id + " (" + u.getUsername() + ") eliminado exitosamente de PostgreSQL");
            Map<String, Object> d = new HashMap<>();
            d.put("id", u.getId());
            d.put("username", u.getUsername());
            resp.put("data", d);
            return ResponseEntity.ok(resp);
        }).orElseGet(() -> {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("mensaje", "Usuario #" + id + " no encontrado para eliminar");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
    }
}
