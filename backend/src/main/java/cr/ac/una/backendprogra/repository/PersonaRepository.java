package cr.ac.una.backendprogra.repository;

import cr.ac.una.backendprogra.entity.Persona;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {

    @Query("SELECT p FROM Persona p WHERE " +
            "(:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
            "(:email IS NULL OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:direccion IS NULL OR LOWER(p.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))) AND " +
            "(:idUsuario IS NULL OR LOWER(p.idUsuario) LIKE LOWER(CONCAT('%', :idUsuario, '%'))) AND " +
            "(:oficinaId IS NULL OR p.oficina.idOficina = :oficinaId) AND " +
            "(:fechaDesde IS NULL OR p.fechaNacimiento >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR p.fechaNacimiento <= :fechaHasta)")
    Page<Persona> findWithFilters(
            @Param("nombre") String nombre,
            @Param("email") String email,
            @Param("direccion") String direccion,
            @Param("idUsuario") String idUsuario,
            @Param("oficinaId") Integer oficinaId,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta,
            Pageable pageable
    );

    @Query("SELECT p FROM Persona p WHERE " +
            "(:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
            "(:email IS NULL OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:direccion IS NULL OR LOWER(p.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))) AND " +
            "(:idUsuario IS NULL OR LOWER(p.idUsuario) LIKE LOWER(CONCAT('%', :idUsuario, '%'))) AND " +
            "(:oficinaId IS NULL OR p.oficina.idOficina = :oficinaId) AND " +
            "(:fechaDesde IS NULL OR p.fechaNacimiento >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR p.fechaNacimiento <= :fechaHasta)")
    List<Persona> findAllWithFilters(
            @Param("nombre") String nombre,
            @Param("email") String email,
            @Param("direccion") String direccion,
            @Param("idUsuario") String idUsuario,
            @Param("oficinaId") Integer oficinaId,
            @Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta
    );
}