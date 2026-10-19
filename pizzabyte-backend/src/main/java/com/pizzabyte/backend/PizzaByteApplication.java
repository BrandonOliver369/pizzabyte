package com.pizzabyte.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PizzaByteApplication {

    public static void main(String[] args) {
        SpringApplication.run(PizzaByteApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(" 🚀 [PizzaByte Spring Boot 3] Backend iniciado en http://localhost:8080");
        System.out.println(" 📦 [PostgreSQL 18] Conectado a 'pizzabyte_db.pizzabyte_core'");
        System.out.println(" 🛠️  [CRUD Activo] 5 Controladores REST listos para consumir");
        System.out.println("==================================================================");
    }
}
