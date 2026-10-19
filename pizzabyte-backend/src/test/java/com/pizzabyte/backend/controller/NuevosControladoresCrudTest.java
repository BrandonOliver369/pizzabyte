package com.pizzabyte.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class NuevosControladoresCrudTest {

    @Autowired
    private MockMvc mockMvc;

    // =========================================================================
    // 1. CONTROLADOR DE PRUEBA: RolController (/api/roles)
    // =========================================================================
    @Test
    @Order(1)
    @DisplayName("RolController: Listar, Crear, Buscar, Actualizar y Eliminar")
    void testRolCrud() throws Exception {
        // Read All
        mockMvc.perform(get("/api/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create
        String nuevoRolJson = """
                {
                    "codigo": "TEST_REPARTIDOR",
                    "nombre": "Repartidor de Prueba",
                    "descripcion": "Rol asignado para pruebas automatizadas"
                }
                """;

        String postResponse = mockMvc.perform(post("/api/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoRolJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codigo").value("TEST_REPARTIDOR"))
                .andReturn().getResponse().getContentAsString();

        // Extract ID
        int id = com.jayway.jsonpath.JsonPath.read(postResponse, "$.data.id");

        // Read One
        mockMvc.perform(get("/api/roles/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));

        // Update
        String updateRolJson = """
                {
                    "nombre": "Repartidor de Prueba Actualizado",
                    "descripcion": "Descripción actualizada"
                }
                """;

        mockMvc.perform(put("/api/roles/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRolJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Repartidor de Prueba Actualizado"));

        // Delete
        mockMvc.perform(delete("/api/roles/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // 2. CONTROLADOR DE PRUEBA: CategoriaController (/api/categorias)
    // =========================================================================
    @Test
    @Order(2)
    @DisplayName("CategoriaController: Listar, Crear, Buscar, Actualizar y Eliminar")
    void testCategoriaCrud() throws Exception {
        // Read All
        mockMvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create
        String nuevaCategoriaJson = """
                {
                    "nombre": "Antipasti y Snacks Test",
                    "descripcion": "Entradas italianas para prueba",
                    "activo": true
                }
                """;

        String postResponse = mockMvc.perform(post("/api/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevaCategoriaJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Antipasti y Snacks Test"))
                .andReturn().getResponse().getContentAsString();

        int id = com.jayway.jsonpath.JsonPath.read(postResponse, "$.data.id");

        // Read One
        mockMvc.perform(get("/api/categorias/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));

        // Update
        String updateCatJson = """
                {
                    "nombre": "Antipasti Gourmet Test",
                    "descripcion": "Nueva descripcion actualizada"
                }
                """;

        mockMvc.perform(put("/api/categorias/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateCatJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Antipasti Gourmet Test"));

        // Delete
        mockMvc.perform(delete("/api/categorias/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // 3. CONTROLADOR DE PRUEBA: TamanoController (/api/tamanos)
    // =========================================================================
    @Test
    @Order(3)
    @DisplayName("TamanoController: Listar, Crear, Buscar, Actualizar y Eliminar")
    void testTamanoCrud() throws Exception {
        // Read All
        mockMvc.perform(get("/api/tamanos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create
        String nuevoTamanoJson = """
                {
                    "codigo": "TEST_JUMBO",
                    "nombre": "Jumbo Party 45cm Test",
                    "multiplicador_precio": 2.25,
                    "porciones": 16,
                    "diametro_cm": 45
                }
                """;

        String postResponse = mockMvc.perform(post("/api/tamanos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoTamanoJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codigo").value("TEST_JUMBO"))
                .andReturn().getResponse().getContentAsString();

        int id = com.jayway.jsonpath.JsonPath.read(postResponse, "$.data.id");

        // Read One
        mockMvc.perform(get("/api/tamanos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));

        // Update
        String updateTamanoJson = """
                {
                    "nombre": "Jumbo Party Editado",
                    "porciones": 18
                }
                """;

        mockMvc.perform(put("/api/tamanos/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateTamanoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Jumbo Party Editado"))
                .andExpect(jsonPath("$.data.porciones").value(18));

        // Delete
        mockMvc.perform(delete("/api/tamanos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // 4. CONTROLADOR DE PRUEBA: MetodoPagoController (/api/metodos-pago)
    // =========================================================================
    @Test
    @Order(4)
    @DisplayName("MetodoPagoController: Listar, Crear, Buscar, Actualizar y Eliminar")
    void testMetodoPagoCrud() throws Exception {
        // Read All
        mockMvc.perform(get("/api/metodos-pago"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create
        String nuevoMetodoJson = """
                {
                    "codigo": "TEST_SPEI",
                    "nombre": "Transferencia SPEI Test",
                    "activo": true
                }
                """;

        String postResponse = mockMvc.perform(post("/api/metodos-pago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevoMetodoJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.codigo").value("TEST_SPEI"))
                .andReturn().getResponse().getContentAsString();

        int id = com.jayway.jsonpath.JsonPath.read(postResponse, "$.data.id");

        // Read One
        mockMvc.perform(get("/api/metodos-pago/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));

        // Update
        String updateMetodoJson = """
                {
                    "nombre": "SPEI / CoDi Instantáneo Test",
                    "activo": true
                }
                """;

        mockMvc.perform(put("/api/metodos-pago/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateMetodoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("SPEI / CoDi Instantáneo Test"));

        // Delete
        mockMvc.perform(delete("/api/metodos-pago/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // 5. CONTROLADOR DE PRUEBA: CiudadController (/api/ciudades)
    // =========================================================================
    @Test
    @Order(5)
    @DisplayName("CiudadController: Listar, Crear, Buscar, Actualizar y Eliminar")
    void testCiudadCrud() throws Exception {
        // Read All
        mockMvc.perform(get("/api/ciudades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Create
        String nuevaCiudadJson = """
                {
                    "nombre": "Querétaro Test"
                }
                """;

        String postResponse = mockMvc.perform(post("/api/ciudades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(nuevaCiudadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Querétaro Test"))
                .andReturn().getResponse().getContentAsString();

        int id = com.jayway.jsonpath.JsonPath.read(postResponse, "$.data.id");

        // Read One
        mockMvc.perform(get("/api/ciudades/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id));

        // Update
        String updateCiudadJson = """
                {
                    "nombre": "Santiago de Querétaro Test"
                }
                """;

        mockMvc.perform(put("/api/ciudades/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateCiudadJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nombre").value("Santiago de Querétaro Test"));

        // Delete
        mockMvc.perform(delete("/api/ciudades/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
