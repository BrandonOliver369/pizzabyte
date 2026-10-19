package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.CuponDescuento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<CuponDescuento, Integer> {
    Optional<CuponDescuento> findByCodigoIgnoreCase(String codigo);
}
