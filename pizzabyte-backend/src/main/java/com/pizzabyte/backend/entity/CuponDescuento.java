package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "cupones_descuento", schema = "pizzabyte_core")
public class CuponDescuento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 30, unique = true)
    private String codigo;

    @Column(name = "porcentaje_descuento", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeDescuento;

    @Column(name = "monto_minimo_compra", precision = 10, scale = 2)
    private BigDecimal montoMinimoCompra = BigDecimal.ZERO;

    @Column(name = "usos_maximos")
    private Integer usosMaximos = 100;

    @Column(name = "usos_actuales")
    private Integer usosActuales = 0;

    private Boolean activo = true;

    @Column(name = "fecha_expiracion")
    private OffsetDateTime fechaExpiracion;

    public CuponDescuento() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo != null ? codigo.toUpperCase().trim() : null; }

    public BigDecimal getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(BigDecimal porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public BigDecimal getMontoMinimoCompra() { return montoMinimoCompra; }
    public void setMontoMinimoCompra(BigDecimal montoMinimoCompra) { this.montoMinimoCompra = montoMinimoCompra; }

    public Integer getUsosMaximos() { return usosMaximos; }
    public void setUsosMaximos(Integer usosMaximos) { this.usosMaximos = usosMaximos; }

    public Integer getUsosActuales() { return usosActuales; }
    public void setUsosActuales(Integer usosActuales) { this.usosActuales = usosActuales; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public OffsetDateTime getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(OffsetDateTime fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
}
