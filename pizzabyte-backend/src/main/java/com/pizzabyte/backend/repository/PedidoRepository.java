package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    Optional<Pedido> findByFolioComanda(String folioComanda);
    List<Pedido> findAllByOrderByCreadoEnDesc();
    List<Pedido> findByEstadoId(Integer estadoId);
}
