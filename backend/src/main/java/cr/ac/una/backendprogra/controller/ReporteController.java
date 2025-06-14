package cr.ac.una.backendprogra.controller;

import com.itextpdf.text.DocumentException;
import cr.ac.una.backendprogra.dto.PersonaFilterDTO;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import cr.ac.una.backendprogra.service.ReporteService;
import cr.ac.una.backendprogra.service.RegistroEntradaSalidaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private ReporteService reporteService;

    @Autowired
    private RegistroEntradaSalidaService registroService;

    @PostMapping("/personas/filtrar")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<Map<String, Object>> filtrarPersonas(@RequestBody PersonaFilterDTO filtros) {
        try {
            Sort sort = Sort.by(filtros.getSortDirection().equals("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC, filtros.getSortBy());
            Pageable pageable = PageRequest.of(filtros.getPage(), filtros.getSize(), sort);

            LocalDate fechaDesde = null;
            LocalDate fechaHasta = null;
            if (filtros.getFechaDesde() != null && !filtros.getFechaDesde().isEmpty()) {
                fechaDesde = LocalDate.parse(filtros.getFechaDesde(), DateTimeFormatter.ISO_LOCAL_DATE);
            }
            if (filtros.getFechaHasta() != null && !filtros.getFechaHasta().isEmpty()) {
                fechaHasta = LocalDate.parse(filtros.getFechaHasta(), DateTimeFormatter.ISO_LOCAL_DATE);
            }

            Page<Persona> resultado = personaRepository.findWithFilters(
                    filtros.getNombre(),
                    filtros.getEmail(),
                    filtros.getDireccion(),
                    filtros.getIdUsuario(),
                    filtros.getOficinaId(),
                    fechaDesde,
                    fechaHasta,
                    pageable
            );

            Map<String, Object> response = new HashMap<>();
            response.put("personas", resultado.getContent());
            response.put("currentPage", resultado.getNumber());
            response.put("totalItems", resultado.getTotalElements());
            response.put("totalPages", resultado.getTotalPages());
            response.put("hasNext", resultado.hasNext());
            response.put("hasPrevious", resultado.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al filtrar personas: " + e.getMessage()));
        }
    }

    @PostMapping("/personas/pdf")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<byte[]> exportarPersonasPDF(@RequestBody PersonaFilterDTO filtros) {
        try {
            LocalDate fechaDesde = null;
            LocalDate fechaHasta = null;
            if (filtros.getFechaDesde() != null && !filtros.getFechaDesde().isEmpty()) {
                fechaDesde = LocalDate.parse(filtros.getFechaDesde(), DateTimeFormatter.ISO_LOCAL_DATE);
            }
            if (filtros.getFechaHasta() != null && !filtros.getFechaHasta().isEmpty()) {
                fechaHasta = LocalDate.parse(filtros.getFechaHasta(), DateTimeFormatter.ISO_LOCAL_DATE);
            }

            List<Persona> personas = personaRepository.findAllWithFilters(
                    filtros.getNombre(),
                    filtros.getEmail(),
                    filtros.getDireccion(),
                    filtros.getIdUsuario(),
                    filtros.getOficinaId(),
                    fechaDesde,
                    fechaHasta
            );

            byte[] pdfBytes = reporteService.generarPDFPersonas(personas);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "reporte-personas.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/personas/excel")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<byte[]> exportarPersonasExcel(@RequestBody PersonaFilterDTO filtros) {
        try {
            LocalDate fechaDesde = null;
            LocalDate fechaHasta = null;
            if (filtros.getFechaDesde() != null && !filtros.getFechaDesde().isEmpty()) {
                fechaDesde = LocalDate.parse(filtros.getFechaDesde(), DateTimeFormatter.ISO_LOCAL_DATE);
            }
            if (filtros.getFechaHasta() != null && !filtros.getFechaHasta().isEmpty()) {
                fechaHasta = LocalDate.parse(filtros.getFechaHasta(), DateTimeFormatter.ISO_LOCAL_DATE);
            }

            List<Persona> personas = personaRepository.findAllWithFilters(
                    filtros.getNombre(),
                    filtros.getEmail(),
                    filtros.getDireccion(),
                    filtros.getIdUsuario(),
                    filtros.getOficinaId(),
                    fechaDesde,
                    fechaHasta
            );

            byte[] excelBytes = reporteService.generarExcelPersonas(personas);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "reporte-personas.xlsx");

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/registros/pdf")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<byte[]> exportarRegistrosPDF(@RequestBody RegistroFilterDTO filtros) {
        try {

            LocalDateTime fechaDesde = null;
            LocalDateTime fechaHasta = null;

            if (filtros.getFechaDesde() != null && !filtros.getFechaDesde().isEmpty()) {
                fechaDesde = LocalDateTime.parse(filtros.getFechaDesde() + "T00:00:00");
            }
            if (filtros.getFechaHasta() != null && !filtros.getFechaHasta().isEmpty()) {
                fechaHasta = LocalDateTime.parse(filtros.getFechaHasta() + "T23:59:59");
            }

            RegistroEntradaSalida.TipoMovimiento tipoEnum = null;
            if (filtros.getTipoMovimiento() != null && !filtros.getTipoMovimiento().isEmpty()) {
                try {
                    tipoEnum = RegistroEntradaSalida.TipoMovimiento.valueOf(filtros.getTipoMovimiento().toUpperCase());
                } catch (IllegalArgumentException e) {

                }
            }

            List<RegistroEntradaSalida> registros = registroService.obtenerTodosLosRegistrosConFiltros(
                    filtros.getPersonaId(),
                    filtros.getOficinaId(),
                    tipoEnum,
                    fechaDesde,
                    fechaHasta
            );

            byte[] pdfBytes = reporteService.generarPDFRegistros(registros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "reporte-registros.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/registros/excel")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('VISOR')")
    public ResponseEntity<byte[]> exportarRegistrosExcel(@RequestBody RegistroFilterDTO filtros) {
        try {

            LocalDateTime fechaDesde = null;
            LocalDateTime fechaHasta = null;

            if (filtros.getFechaDesde() != null && !filtros.getFechaDesde().isEmpty()) {
                fechaDesde = LocalDateTime.parse(filtros.getFechaDesde() + "T00:00:00");
            }
            if (filtros.getFechaHasta() != null && !filtros.getFechaHasta().isEmpty()) {
                fechaHasta = LocalDateTime.parse(filtros.getFechaHasta() + "T23:59:59");
            }

            RegistroEntradaSalida.TipoMovimiento tipoEnum = null;
            if (filtros.getTipoMovimiento() != null && !filtros.getTipoMovimiento().isEmpty()) {
                try {
                    tipoEnum = RegistroEntradaSalida.TipoMovimiento.valueOf(filtros.getTipoMovimiento().toUpperCase());
                } catch (IllegalArgumentException e) {
                }
            }

            List<RegistroEntradaSalida> registros = registroService.obtenerTodosLosRegistrosConFiltros(
                    filtros.getPersonaId(),
                    filtros.getOficinaId(),
                    tipoEnum,
                    fechaDesde,
                    fechaHasta
            );

            byte[] excelBytes = reporteService.generarExcelRegistros(registros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "reporte-registros.xlsx");

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    public static class RegistroFilterDTO {
        private Integer personaId;
        private Integer oficinaId;
        private String tipoMovimiento;
        private String fechaDesde;
        private String fechaHasta;

        public Integer getPersonaId() { return personaId; }
        public void setPersonaId(Integer personaId) { this.personaId = personaId; }
        public Integer getOficinaId() { return oficinaId; }
        public void setOficinaId(Integer oficinaId) { this.oficinaId = oficinaId; }
        public String getTipoMovimiento() { return tipoMovimiento; }
        public void setTipoMovimiento(String tipoMovimiento) { this.tipoMovimiento = tipoMovimiento; }
        public String getFechaDesde() { return fechaDesde; }
        public void setFechaDesde(String fechaDesde) { this.fechaDesde = fechaDesde; }
        public String getFechaHasta() { return fechaHasta; }
        public void setFechaHasta(String fechaHasta) { this.fechaHasta = fechaHasta; }
    }
}