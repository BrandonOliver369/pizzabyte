package com.pizzabyte.backend.repository;

import com.pizzabyte.backend.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByCodigoIgnoreCase(String codigo);
}
