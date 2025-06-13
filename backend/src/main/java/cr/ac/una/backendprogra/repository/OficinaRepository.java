package cr.ac.una.backendprogra.repository;

import cr.ac.una.backendprogra.entity.Oficina;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface OficinaRepository extends JpaRepository<Oficina, Integer> {

}

