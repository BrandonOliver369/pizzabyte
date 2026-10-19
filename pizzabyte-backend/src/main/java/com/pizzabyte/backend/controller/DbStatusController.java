package com.pizzabyte.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/db/status")
@CrossOrigin(origins = "http://localhost:4200")
public class DbStatusController {

    @Autowired
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkStatus() {
        Map<String, Object> response = new HashMap<>();
        boolean conectado = false;
        try (Connection conn = dataSource.getConnection()) {
            conectado = conn.isValid(2);
        } catch (Exception e) {
            conectado = false;
        }

        response.put("conectado", conectado);
        response.put("framework", "Spring Boot 3.3.5 (Java 21/25)");
        response.put("motor", "PostgreSQL 18");
        response.put("baseDeDatos", "pizzabyte_db");
        response.put("esquema", "pizzabyte_core");
        response.put("host", "localhost:5432");
        response.put("normalizacion", "3NF (Tercera Forma Normal)");
        response.put("controladoresCrud", List.of(
                "/api/productos (GET, POST, PUT, DELETE)",
                "/api/ingredientes (GET, POST, PUT, DELETE)",
                "/api/cupones (GET, POST, PUT, DELETE)",
                "/api/pedidos (GET, POST, PUT, PATCH, DELETE)",
                "/api/usuarios (GET, POST, PUT, DELETE)"
        ));
        response.put("estado", conectado ? "OPERATIVO_CONECTADO" : "ERROR_CONEXION");

        return ResponseEntity.ok(response);
    }
}
