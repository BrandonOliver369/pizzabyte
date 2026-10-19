package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "ciudades", schema = "pizzabyte_core")
public class Ciudad implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 80)
    private String nombre;

    public Ciudad() {}

    public Ciudad(String nombre) {
        this.nombre = nombre;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
