package cr.ac.una.backendprogra.service;

import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.repository.RegistroEntradaSalidaRepository;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstadisticasService {

    @Autowired
    private RegistroEntradaSalidaRepository registroRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private OficinaRepository oficinaRepository;

    public List<PersonaIngresosDTO> obtenerPersonasConMasIngresos(LocalDate fechaDesde, LocalDate fechaHasta) {
        return obtenerPersonasConMasIngresos(fechaDesde, fechaHasta, 10);
    }

    public List<PersonaIngresosDTO> obtenerPersonasConMasIngresos(LocalDate fechaDesde, LocalDate fechaHasta, int limite) {
        LocalDateTime fechaDesdeDateTime = fechaDesde != null ? fechaDesde.atStartOfDay() : null;
        LocalDateTime fechaHastaDateTime = fechaHasta != null ? fechaHasta.atTime(23, 59, 59) : null;

        List<RegistroEntradaSalida> registros = registroRepository.findAllWithFilters(
                null, null, RegistroEntradaSalida.TipoMovimiento.ENTRADA,
                fechaDesdeDateTime, fechaHastaDateTime);

        Map<Persona, Long> conteoPorPersona = registros.stream()
                .collect(Collectors.groupingBy(
                        RegistroEntradaSalida::getPersona,
                        Collectors.counting()
                ));

        return conteoPorPersona.entrySet().stream()
                .map(entry -> new PersonaIngresosDTO(
                        entry.getKey().getIdAuto(),
                        entry.getKey().getNombre(),
                        entry.getKey().getIdUsuario(),
                        entry.getValue().intValue()
                ))
                .sorted((a, b) -> Integer.compare(b.getCantidadIngresos(), a.getCantidadIngresos()))
                .limit(limite)
                .collect(Collectors.toList());
    }

    public List<OficinaOcupacionDTO> obtenerOficinasConMasOcupacion(LocalDate fechaDesde, LocalDate fechaHasta) {
        LocalDateTime fechaDesdeDateTime = fechaDesde != null ? fechaDesde.atStartOfDay() : null;
        LocalDateTime fechaHastaDateTime = fechaHasta != null ? fechaHasta.atTime(23, 59, 59) : null;

        List<RegistroEntradaSalida> registros = registroRepository.findAllWithFilters(
                null, null, RegistroEntradaSalida.TipoMovimiento.ENTRADA,
                fechaDesdeDateTime, fechaHastaDateTime);

        Map<Oficina, Long> conteoPorOficina = registros.stream()
                .collect(Collectors.groupingBy(
                        RegistroEntradaSalida::getOficina,
                        Collectors.counting()
                ));

        return conteoPorOficina.entrySet().stream()
                .map(entry -> new OficinaOcupacionDTO(
                        entry.getKey().getIdOficina(),
                        entry.getKey().getNombre(),
                        entry.getKey().getUbicacion(),
                        entry.getValue().intValue(),
                        entry.getKey().getCapacidadMaxima()
                ))
                .sorted((a, b) -> Integer.compare(b.getTotalIngresos(), a.getTotalIngresos()))
                .collect(Collectors.toList());
    }

    public List<PersonaEnOficinaDTO> obtenerPersonasActualmenteEnOficinas() {
        List<Oficina> todasLasOficinas = oficinaRepository.findAll();
        List<PersonaEnOficinaDTO> resultado = new ArrayList<>();

        for (Oficina oficina : todasLasOficinas) {
            List<Persona> personasEnOficina = registroRepository.findPersonasEnOficina(oficina.getIdOficina());
            Long contadorPersonas = registroRepository.contarPersonasEnOficina(oficina.getIdOficina());

            if (!personasEnOficina.isEmpty()) {
                List<PersonaActualDTO> personasDTO = personasEnOficina.stream()
                        .map(persona -> new PersonaActualDTO(
                                persona.getIdAuto(),
                                persona.getNombre(),
                                persona.getIdUsuario(),
                                obtenerUltimaHoraEntrada(persona.getIdAuto(), oficina.getIdOficina())
                        ))
                        .collect(Collectors.toList());

                resultado.add(new PersonaEnOficinaDTO(
                        oficina.getIdOficina(),
                        oficina.getNombre(),
                        oficina.getUbicacion(),
                        contadorPersonas.intValue(),
                        oficina.getCapacidadMaxima(),
                        personasDTO
                ));
            }
        }

        return resultado.stream()
                .sorted((a, b) -> Integer.compare(b.getPersonasActualmente(), a.getPersonasActualmente()))
                .collect(Collectors.toList());
    }

    public ResumenGeneralDTO obtenerResumenGeneral() {
        long totalPersonas = personaRepository.count();
        long totalOficinas = oficinaRepository.count();
        long totalRegistrosHoy = contarRegistrosDelDia();
        long personasActualmenteEnOficinas = contarPersonasEnTodasLasOficinas();

        return new ResumenGeneralDTO(
                (int) totalPersonas,
                (int) totalOficinas,
                (int) totalRegistrosHoy,
                (int) personasActualmenteEnOficinas
        );
    }

    private LocalDateTime obtenerUltimaHoraEntrada(Integer personaId, Integer oficinaId) {
        List<RegistroEntradaSalida> registros = registroRepository.findAllWithFilters(
                personaId, oficinaId, RegistroEntradaSalida.TipoMovimiento.ENTRADA, null, null);

        return registros.stream()
                .max(Comparator.comparing(RegistroEntradaSalida::getFechaHora))
                .map(RegistroEntradaSalida::getFechaHora)
                .orElse(null);
    }

    private long contarRegistrosDelDia() {
        LocalDateTime inicioDelDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDelDia = LocalDate.now().atTime(23, 59, 59);

        return registroRepository.findAllWithFilters(null, null, null, inicioDelDia, finDelDia).size();
    }

    private long contarPersonasEnTodasLasOficinas() {
        return oficinaRepository.findAll().stream()
                .mapToLong(oficina -> registroRepository.contarPersonasEnOficina(oficina.getIdOficina()))
                .sum();
    }

    public static class PersonaIngresosDTO {
        private Integer personaId;
        private String nombre;
        private String idUsuario;
        private Integer cantidadIngresos;

        public PersonaIngresosDTO(Integer personaId, String nombre, String idUsuario, Integer cantidadIngresos) {
            this.personaId = personaId;
            this.nombre = nombre;
            this.idUsuario = idUsuario;
            this.cantidadIngresos = cantidadIngresos;
        }

        public Integer getPersonaId() { return personaId; }
        public String getNombre() { return nombre; }
        public String getIdUsuario() { return idUsuario; }
        public Integer getCantidadIngresos() { return cantidadIngresos; }
    }

    public static class OficinaOcupacionDTO {
        private Integer oficinaId;
        private String nombre;
        private String ubicacion;
        private Integer totalIngresos;
        private Integer capacidadMaxima;

        public OficinaOcupacionDTO(Integer oficinaId, String nombre, String ubicacion, Integer totalIngresos, Integer capacidadMaxima) {
            this.oficinaId = oficinaId;
            this.nombre = nombre;
            this.ubicacion = ubicacion;
            this.totalIngresos = totalIngresos;
            this.capacidadMaxima = capacidadMaxima;
        }

        public Integer getOficinaId() { return oficinaId; }
        public String getNombre() { return nombre; }
        public String getUbicacion() { return ubicacion; }
        public Integer getTotalIngresos() { return totalIngresos; }
        public Integer getCapacidadMaxima() { return capacidadMaxima; }
    }

    public static class PersonaEnOficinaDTO {
        private Integer oficinaId;
        private String nombreOficina;
        private String ubicacion;
        private Integer personasActualmente;
        private Integer capacidadMaxima;
        private List<PersonaActualDTO> personas;

        public PersonaEnOficinaDTO(Integer oficinaId, String nombreOficina, String ubicacion,
                                   Integer personasActualmente, Integer capacidadMaxima, List<PersonaActualDTO> personas) {
            this.oficinaId = oficinaId;
            this.nombreOficina = nombreOficina;
            this.ubicacion = ubicacion;
            this.personasActualmente = personasActualmente;
            this.capacidadMaxima = capacidadMaxima;
            this.personas = personas;
        }

        public Integer getOficinaId() { return oficinaId; }
        public String getNombreOficina() { return nombreOficina; }
        public String getUbicacion() { return ubicacion; }
        public Integer getPersonasActualmente() { return personasActualmente; }
        public Integer getCapacidadMaxima() { return capacidadMaxima; }
        public List<PersonaActualDTO> getPersonas() { return personas; }
    }

    public static class PersonaActualDTO {
        private Integer personaId;
        private String nombre;
        private String idUsuario;
        private LocalDateTime horaEntrada;

        public PersonaActualDTO(Integer personaId, String nombre, String idUsuario, LocalDateTime horaEntrada) {
            this.personaId = personaId;
            this.nombre = nombre;
            this.idUsuario = idUsuario;
            this.horaEntrada = horaEntrada;
        }

        public Integer getPersonaId() { return personaId; }
        public String getNombre() { return nombre; }
        public String getIdUsuario() { return idUsuario; }
        public LocalDateTime getHoraEntrada() { return horaEntrada; }
    }

    public static class ResumenGeneralDTO {
        private Integer totalPersonas;
        private Integer totalOficinas;
        private Integer registrosHoy;
        private Integer personasEnOficinas;

        public ResumenGeneralDTO(Integer totalPersonas, Integer totalOficinas, Integer registrosHoy, Integer personasEnOficinas) {
            this.totalPersonas = totalPersonas;
            this.totalOficinas = totalOficinas;
            this.registrosHoy = registrosHoy;
            this.personasEnOficinas = personasEnOficinas;
        }

        public Integer getTotalPersonas() { return totalPersonas; }
        public Integer getTotalOficinas() { return totalOficinas; }
        public Integer getRegistrosHoy() { return registrosHoy; }
        public Integer getPersonasEnOficinas() { return personasEnOficinas; }
    }
}