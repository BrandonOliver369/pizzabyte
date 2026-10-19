package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, Integer> {
    Optional<Ingrediente> findByNombreIgnoreCase(String nombre);
}
