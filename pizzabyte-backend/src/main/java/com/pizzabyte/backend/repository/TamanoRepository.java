package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.Tamano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TamanoRepository extends JpaRepository<Tamano, Integer> {
    Optional<Tamano> findByCodigoIgnoreCase(String codigo);
}
