package com.pizzabyte.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.OffsetDateTime;

@Entity
@Table(name = "solicitudes_arco", schema = "pizzabyte_core")
public class SolicitudArco implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30, unique = true)
    private String folio;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", insertable = false, updatable = false)
    private Usuario usuario;

    @Column(name = "tipo_derecho", nullable = false, length = 20)
    private String tipoDerecho; // 'ACCESO', 'RECTIFICACION', 'CANCELACION', 'OPOSICION'

    @Column(name = "descripcion_peticion", nullable = false, columnDefinition = "TEXT")
    private String descripcionPeticion;

    @Column(name = "datos_especificos", columnDefinition = "TEXT")
    private String datosEspecificos;

    @Column(length = 20)
    private String estado = "RECIBIDA"; // 'RECIBIDA', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA'

    @Column(name = "fecha_solicitud", insertable = false, updatable = false)
    private OffsetDateTime fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private OffsetDateTime fechaResolucion;

    @Column(name = "respuesta_resolucion", columnDefinition = "TEXT")
    private String respuestaResolucion;

    public SolicitudArco() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFolio() { return folio; }
    public void setFolio(String folio) { this.folio = folio; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getTipoDerecho() { return tipoDerecho; }
    public void setTipoDerecho(String tipoDerecho) { this.tipoDerecho = tipoDerecho; }

    public String getDescripcionPeticion() { return descripcionPeticion; }
    public void setDescripcionPeticion(String descripcionPeticion) { this.descripcionPeticion = descripcionPeticion; }

    public String getDatosEspecificos() { return datosEspecificos; }
    public void setDatosEspecificos(String datosEspecificos) { this.datosEspecificos = datosEspecificos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public OffsetDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(OffsetDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public OffsetDateTime getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(OffsetDateTime fechaResolucion) { this.fechaResolucion = fechaResolucion; }

    public String getRespuestaResolucion() { return respuestaResolucion; }
    public void setRespuestaResolucion(String respuestaResolucion) { this.respuestaResolucion = respuestaResolucion; }
}
