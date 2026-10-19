package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredientes", schema = "pizzabyte_core")
public class Ingrediente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 80, unique = true)
    private String nombre;

    @Column(name = "costo_extra", precision = 10, scale = 2)
    private BigDecimal costoExtra = BigDecimal.ZERO;

    @Column(name = "stock_disponible")
    private Integer stockDisponible = 100;

    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida = "porción";

    public Ingrediente() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public BigDecimal getCostoExtra() { return costoExtra; }
    public void setCostoExtra(BigDecimal costoExtra) { this.costoExtra = costoExtra; }

    public Integer getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(Integer stockDisponible) { this.stockDisponible = stockDisponible; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
}
