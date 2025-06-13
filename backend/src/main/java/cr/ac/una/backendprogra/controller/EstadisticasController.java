package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.service.EstadisticasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin(origins = "*")
public class EstadisticasController {

    @Autowired
    private EstadisticasService estadisticasService;

    // Solo necesitas ajustar este método en EstadisticasController.java:

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerDashboard(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {

        try {
            // Si no se proporcionan fechas, usar null (sin filtros)
            LocalDate fechaDesdeDate = null;
            LocalDate fechaHastaDate = null;

            if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
                fechaDesdeDate = LocalDate.parse(fechaDesde);
            }
            if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
                fechaHastaDate = LocalDate.parse(fechaHasta);
            }

            // Obtener todas las estadísticas (sin filtros si fechas son null)
            var personasConMasIngresos = estadisticasService.obtenerPersonasConMasIngresos(fechaDesdeDate, fechaHastaDate);
            var oficinasConMasOcupacion = estadisticasService.obtenerOficinasConMasOcupacion(fechaDesdeDate, fechaHastaDate);
            var personasActualmenteEnOficinas = estadisticasService.obtenerPersonasActualmenteEnOficinas();

            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("personasConMasIngresos", personasConMasIngresos);
            dashboard.put("oficinasConMasOcupacion", oficinasConMasOcupacion);
            dashboard.put("personasActualmenteEnOficinas", personasActualmenteEnOficinas);

            return ResponseEntity.ok(dashboard);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener estadísticas: " + e.getMessage()));
        }
    }

    @GetMapping("/personas-con-mas-ingresos")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerPersonasConMasIngresos(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(defaultValue = "10") int limite) {

        try {
            LocalDate fechaDesdeDate = null;
            LocalDate fechaHastaDate = null;

            if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
                fechaDesdeDate = LocalDate.parse(fechaDesde);
            }
            if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
                fechaHastaDate = LocalDate.parse(fechaHasta);
            }

            var resultado = estadisticasService.obtenerPersonasConMasIngresos(fechaDesdeDate, fechaHastaDate, limite);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener personas con más ingresos: " + e.getMessage()));
        }
    }

    @GetMapping("/oficinas-con-mas-ocupacion")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerOficinasConMasOcupacion(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {

        try {
            LocalDate fechaDesdeDate = null;
            LocalDate fechaHastaDate = null;

            if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
                fechaDesdeDate = LocalDate.parse(fechaDesde);
            }
            if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
                fechaHastaDate = LocalDate.parse(fechaHasta);
            }

            var resultado = estadisticasService.obtenerOficinasConMasOcupacion(fechaDesdeDate, fechaHastaDate);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener oficinas con más ocupación: " + e.getMessage()));
        }
    }

    @GetMapping("/personas-actualmente-en-oficinas")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR') or hasRole('REGISTRADOR')")
    public ResponseEntity<?> obtenerPersonasActualmenteEnOficinas() {
        try {
            var resultado = estadisticasService.obtenerPersonasActualmenteEnOficinas();
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener personas actualmente en oficinas: " + e.getMessage()));
        }
    }

    @GetMapping("/resumen-general")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<?> obtenerResumenGeneral() {
        try {
            var resumen = estadisticasService.obtenerResumenGeneral();
            return ResponseEntity.ok(resumen);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener resumen general: " + e.getMessage()));
        }
    }
}