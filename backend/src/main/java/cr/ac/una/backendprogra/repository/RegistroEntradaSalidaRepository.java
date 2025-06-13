package cr.ac.una.backendprogra.repository;

import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.entity.Oficina;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroEntradaSalidaRepository extends JpaRepository<RegistroEntradaSalida, Long> {

    @Query("SELECT r FROM RegistroEntradaSalida r WHERE r.persona.idAuto = :personaId " +
            "ORDER BY r.fechaHora DESC LIMIT 1")
    Optional<RegistroEntradaSalida> findUltimoRegistroByPersona(@Param("personaId") Integer personaId);

    @Query("SELECT COUNT(DISTINCT r1.persona.idAuto) FROM RegistroEntradaSalida r1 " +
            "WHERE r1.oficina.idOficina = :oficinaId " +
            "AND r1.tipoMovimiento = 'ENTRADA' " +
            "AND NOT EXISTS (SELECT r2 FROM RegistroEntradaSalida r2 " +
            "WHERE r2.persona.idAuto = r1.persona.idAuto " +
            "AND r2.oficina.idOficina = :oficinaId " +
            "AND r2.tipoMovimiento = 'SALIDA' " +
            "AND r2.fechaHora > r1.fechaHora)")
    Long contarPersonasEnOficina(@Param("oficinaId") Integer oficinaId);

    @Query("SELECT CASE WHEN COUNT(r1) > 0 THEN true ELSE false END FROM RegistroEntradaSalida r1 " +
            "WHERE r1.persona.idAuto = :personaId " +
            "AND r1.oficina.idOficina = :oficinaId " +
            "AND r1.tipoMovimiento = 'ENTRADA' " +
            "AND NOT EXISTS (SELECT r2 FROM RegistroEntradaSalida r2 " +
            "WHERE r2.persona.idAuto = :personaId " +
            "AND r2.oficina.idOficina = :oficinaId " +
            "AND r2.tipoMovimiento = 'SALIDA' " +
            "AND r2.fechaHora > r1.fechaHora)")
    Boolean estaPersonaEnOficina(@Param("personaId") Integer personaId, @Param("oficinaId") Integer oficinaId);

    @Query("SELECT r FROM RegistroEntradaSalida r WHERE " +
            "(:personaId IS NULL OR r.persona.idAuto = :personaId) AND " +
            "(:oficinaId IS NULL OR r.oficina.idOficina = :oficinaId) AND " +
            "(:tipoMovimiento IS NULL OR r.tipoMovimiento = :tipoMovimiento) AND " +
            "(:fechaDesde IS NULL OR r.fechaHora >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR r.fechaHora <= :fechaHasta)")
    Page<RegistroEntradaSalida> findWithFilters(
            @Param("personaId") Integer personaId,
            @Param("oficinaId") Integer oficinaId,
            @Param("tipoMovimiento") RegistroEntradaSalida.TipoMovimiento tipoMovimiento,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            Pageable pageable
    );

    @Query("SELECT r FROM RegistroEntradaSalida r WHERE " +
            "(:personaId IS NULL OR r.persona.idAuto = :personaId) AND " +
            "(:oficinaId IS NULL OR r.oficina.idOficina = :oficinaId) AND " +
            "(:tipoMovimiento IS NULL OR r.tipoMovimiento = :tipoMovimiento) AND " +
            "(:fechaDesde IS NULL OR r.fechaHora >= :fechaDesde) AND " +
            "(:fechaHasta IS NULL OR r.fechaHora <= :fechaHasta) " +
            "ORDER BY r.fechaHora DESC")
    List<RegistroEntradaSalida> findAllWithFilters(
            @Param("personaId") Integer personaId,
            @Param("oficinaId") Integer oficinaId,
            @Param("tipoMovimiento") RegistroEntradaSalida.TipoMovimiento tipoMovimiento,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta
    );

    @Query("SELECT DISTINCT r1.persona FROM RegistroEntradaSalida r1 " +
            "WHERE r1.oficina.idOficina = :oficinaId " +
            "AND r1.tipoMovimiento = 'ENTRADA' " +
            "AND NOT EXISTS (SELECT r2 FROM RegistroEntradaSalida r2 " +
            "WHERE r2.persona.idAuto = r1.persona.idAuto " +
            "AND r2.oficina.idOficina = :oficinaId " +
            "AND r2.tipoMovimiento = 'SALIDA' " +
            "AND r2.fechaHora > r1.fechaHora)")
    List<Persona> findPersonasEnOficina(@Param("oficinaId") Integer oficinaId);

    @Query("SELECT r FROM RegistroEntradaSalida r WHERE r.persona.idAuto = :personaId " +
            "ORDER BY r.fechaHora DESC")
    Page<RegistroEntradaSalida> findByPersonaOrderByFechaHoraDesc(@Param("personaId") Integer personaId, Pageable pageable);

    @Query("SELECT r FROM RegistroEntradaSalida r WHERE r.oficina.idOficina = :oficinaId " +
            "AND DATE(r.fechaHora) = DATE(:fecha) " +
            "ORDER BY r.fechaHora DESC")
    List<RegistroEntradaSalida> findByOficinaAndFecha(@Param("oficinaId") Integer oficinaId,
                                                      @Param("fecha") LocalDateTime fecha);
}