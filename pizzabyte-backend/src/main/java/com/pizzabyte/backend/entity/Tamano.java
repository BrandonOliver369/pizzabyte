package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "tamanos", schema = "pizzabyte_core")
public class Tamano implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20, unique = true)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "multiplicador_precio", nullable = false, precision = 4, scale = 2)
    private BigDecimal multiplicadorPrecio = BigDecimal.valueOf(1.00);

    @Column(nullable = false)
    private Integer porciones;

    @Column(name = "diametro_cm", nullable = false)
    private Integer diametroCm;

    public Tamano() {}

    public Tamano(String codigo, String nombre, BigDecimal multiplicadorPrecio, Integer porciones, Integer diametroCm) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.multiplicadorPrecio = multiplicadorPrecio;
        this.porciones = porciones;
        this.diametroCm = diametroCm;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getMultiplicadorPrecio() {
        return multiplicadorPrecio;
    }

    public void setMultiplicadorPrecio(BigDecimal multiplicadorPrecio) {
        this.multiplicadorPrecio = multiplicadorPrecio;
    }

    public Integer getPorciones() {
        return porciones;
    }

    public void setPorciones(Integer porciones) {
        this.porciones = porciones;
    }

    public Integer getDiametroCm() {
        return diametroCm;
    }

    public void setDiametroCm(Integer diametroCm) {
        this.diametroCm = diametroCm;
    }
}
