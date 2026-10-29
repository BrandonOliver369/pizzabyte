package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.SolicitudArco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudArcoRepository extends JpaRepository<SolicitudArco, Long> {
    Optional<SolicitudArco> findByFolio(String folio);
    List<SolicitudArco> findByUsuarioId(Long usuarioId);
    List<SolicitudArco> findByTipoDerecho(String tipoDerecho);
}
