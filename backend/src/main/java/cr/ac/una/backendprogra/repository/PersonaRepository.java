package cr.ac.una.backendprogra.repository;

import cr.ac.una.backendprogra.entity.Persona;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Indica que es un repositorio, pertenece a Spring. Este, por dentro tiene delete, save, findAll, etc.

public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    // JpaRepository es una interfaz que permite realizar operaciones CRUD en la base de datos.
    // Persona es la entidad e Integer es el tipo de dato de la llave primaria.

}
