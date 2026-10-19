package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pedidos", schema = "pizzabyte_core")
public class Pedido implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folio_comanda", nullable = false, length = 30, unique = true)
    private String folioComanda;

    @Column(name = "cliente_id", nullable = false)
    private Long clienteId = 2L;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", insertable = false, updatable = false)
    private Usuario cliente;

    @Column(name = "origen_pedido", length = 20)
    private String origenPedido = "WEB";

    @Column(name = "tipo_entrega", length = 30)
    private String tipoEntrega = "A_DOMICILIO";

    @Column(name = "direccion_entrega_id")
    private Long direccionEntregaId;

    @Column(name = "notas_cocina", columnDefinition = "TEXT")
    private String notasCocina;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "monto_descuento", precision = 10, scale = 2)
    private BigDecimal montoDescuento = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "estado_id", nullable = false)
    private Integer estadoId = 2; // CONFIRMADO

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estado_id", insertable = false, updatable = false)
    private EstadoPedido estado;

    @Column(name = "cupon_id")
    private Integer cuponId;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @Column(name = "actualizado_en")
    private OffsetDateTime actualizadoEn;

    public Pedido() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFolioComanda() { return folioComanda; }
    public void setFolioComanda(String folioComanda) { this.folioComanda = folioComanda; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Usuario getCliente() { return cliente; }
    public void setCliente(Usuario cliente) { this.cliente = cliente; }

    public String getOrigenPedido() { return origenPedido; }
    public void setOrigenPedido(String origenPedido) { this.origenPedido = origenPedido; }

    public String getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }

    public Long getDireccionEntregaId() { return direccionEntregaId; }
    public void setDireccionEntregaId(Long direccionEntregaId) { this.direccionEntregaId = direccionEntregaId; }

    public String getNotasCocina() { return notasCocina; }
    public void setNotasCocina(String notasCocina) { this.notasCocina = notasCocina; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getMontoDescuento() { return montoDescuento; }
    public void setMontoDescuento(BigDecimal montoDescuento) { this.montoDescuento = montoDescuento; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Integer getEstadoId() { return estadoId; }
    public void setEstadoId(Integer estadoId) { this.estadoId = estadoId; }

    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }

    public Integer getCuponId() { return cuponId; }
    public void setCuponId(Integer cuponId) { this.cuponId = cuponId; }

    public OffsetDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(OffsetDateTime creadoEn) { this.creadoEn = creadoEn; }

    public OffsetDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(OffsetDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
