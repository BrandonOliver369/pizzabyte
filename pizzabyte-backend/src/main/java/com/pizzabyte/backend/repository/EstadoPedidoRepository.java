package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoPedidoRepository extends JpaRepository<EstadoPedido, Integer> {
    Optional<EstadoPedido> findByCodigoIgnoreCase(String codigo);
}
