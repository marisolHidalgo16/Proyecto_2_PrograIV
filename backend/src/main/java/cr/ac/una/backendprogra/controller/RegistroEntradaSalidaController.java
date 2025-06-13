package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.service.RegistroEntradaSalidaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registros")
@CrossOrigin(origins = "*")
public class RegistroEntradaSalidaController {

    @Autowired
    private RegistroEntradaSalidaService registroService;

    @PostMapping("/entrada")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<?> registrarEntrada(@RequestBody RegistroEntradaDTO dto) {
        try {
            String usuarioRegistro = SecurityContextHolder.getContext().getAuthentication().getName();

            RegistroEntradaSalida registro = registroService.registrarEntrada(
                    dto.getPersonaId(),
                    dto.getOficinaId(),
                    dto.getFechaHora(), // ← AGREGADO: usar fecha/hora personalizada
                    dto.getObservaciones(),
                    usuarioRegistro
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Entrada registrada correctamente");
            response.put("registro", registro);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/salida")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<?> registrarSalida(@RequestBody RegistroSalidaDTO dto) {
        try {
            String usuarioRegistro = SecurityContextHolder.getContext().getAuthentication().getName();

            RegistroEntradaSalida registro = registroService.registrarSalida(
                    dto.getPersonaId(),
                    dto.getOficinaId(),
                    dto.getFechaHora(), // ← AGREGADO: usar fecha/hora personalizada
                    dto.getObservaciones(),
                    usuarioRegistro
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Salida registrada correctamente");
            response.put("registro", registro);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerRegistros(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "fechaHora") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) Integer personaId,
            @RequestParam(required = false) Integer oficinaId,
            @RequestParam(required = false) String tipoMovimiento,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {

        try {

            System.out.println("=== PARÁMETROS RECIBIDOS REGISTROS ===");
            System.out.println("personaId: " + personaId);
            System.out.println("oficinaId: " + oficinaId);
            System.out.println("tipoMovimiento: " + tipoMovimiento);
            System.out.println("fechaDesde: " + fechaDesde);
            System.out.println("fechaHasta: " + fechaHasta);
            System.out.println("=======================================");

            Sort sort = Sort.by(sortDirection.equals("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            LocalDateTime fechaDesdeDate = null;
            LocalDateTime fechaHastaDate = null;

            if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
                fechaDesdeDate = LocalDateTime.parse(fechaDesde + "T00:00:00");
            }
            if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
                fechaHastaDate = LocalDateTime.parse(fechaHasta + "T23:59:59");
            }

            RegistroEntradaSalida.TipoMovimiento tipoEnum = null;
            if (tipoMovimiento != null && !tipoMovimiento.trim().isEmpty()) {
                try {
                    tipoEnum = RegistroEntradaSalida.TipoMovimiento.valueOf(tipoMovimiento.toUpperCase());
                } catch (IllegalArgumentException e) {
                    // Ignorar si no es válido
                }
            }

            Page<RegistroEntradaSalida> pageRegistros = registroService.obtenerRegistrosConFiltros(
                    personaId, oficinaId, tipoEnum, fechaDesdeDate, fechaHastaDate, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("registros", pageRegistros.getContent());
            response.put("currentPage", pageRegistros.getNumber());
            response.put("totalItems", pageRegistros.getTotalElements());
            response.put("totalPages", pageRegistros.getTotalPages());
            response.put("hasNext", pageRegistros.hasNext());
            response.put("hasPrevious", pageRegistros.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener registros: " + e.getMessage()));
        }
    }

    @GetMapping("/oficina/{oficinaId}/personas")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<?> obtenerPersonasEnOficina(@PathVariable Integer oficinaId) {
        try {
            List<Persona> personas = registroService.obtenerPersonasEnOficina(oficinaId);
            Long contador = registroService.contarPersonasEnOficina(oficinaId);

            Map<String, Object> response = new HashMap<>();
            response.put("personas", personas);
            response.put("total", contador);
            response.put("oficinaId", oficinaId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener personas en oficina: " + e.getMessage()));
        }
    }

    @GetMapping("/oficina/{oficinaId}/estadisticas")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerEstadisticasOficina(@PathVariable Integer oficinaId) {
        try {
            RegistroEntradaSalidaService.OficinaEstadisticas estadisticas =
                    registroService.obtenerEstadisticasOficina(oficinaId);

            if (estadisticas == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    @GetMapping("/persona/{personaId}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<?> obtenerEstadoPersona(@PathVariable Integer personaId) {
        try {
            String estado = registroService.obtenerEstadoPersona(personaId);

            Map<String, Object> response = new HashMap<>();
            response.put("personaId", personaId);
            response.put("estado", estado);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener estado de persona: " + e.getMessage()));
        }
    }

    @GetMapping("/persona/{personaId}/historial")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerHistorialPersona(
            @PathVariable Integer personaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<RegistroEntradaSalida> historial = registroService.obtenerHistorialPersona(personaId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("registros", historial.getContent());
            response.put("currentPage", historial.getNumber());
            response.put("totalItems", historial.getTotalElements());
            response.put("totalPages", historial.getTotalPages());
            response.put("personaId", personaId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener historial: " + e.getMessage()));
        }
    }

    public static class RegistroEntradaDTO {
        private Integer personaId;
        private Integer oficinaId;
        private LocalDateTime fechaHora; // ← AGREGADO
        private String observaciones;

        public Integer getPersonaId() { return personaId; }
        public void setPersonaId(Integer personaId) { this.personaId = personaId; }

        public Integer getOficinaId() { return oficinaId; }
        public void setOficinaId(Integer oficinaId) { this.oficinaId = oficinaId; }

        public LocalDateTime getFechaHora() { return fechaHora; } // ← AGREGADO
        public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; } // ← AGREGADO

        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }

    public static class RegistroSalidaDTO {
        private Integer personaId;
        private Integer oficinaId;
        private LocalDateTime fechaHora;
        private String observaciones;

        public Integer getPersonaId() { return personaId; }
        public void setPersonaId(Integer personaId) { this.personaId = personaId; }

        public Integer getOficinaId() { return oficinaId; }
        public void setOficinaId(Integer oficinaId) { this.oficinaId = oficinaId; }

        public LocalDateTime getFechaHora() { return fechaHora; }
        public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

        public String getObservaciones() { return observaciones; }
        public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    }
}