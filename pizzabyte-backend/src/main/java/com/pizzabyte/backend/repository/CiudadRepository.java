package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.Ciudad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CiudadRepository extends JpaRepository<Ciudad, Integer> {
    Optional<Ciudad> findByNombreIgnoreCase(String nombre);
}
