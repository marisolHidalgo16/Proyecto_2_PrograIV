package cr.ac.una.backendprogra.service;

import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.repository.RegistroEntradaSalidaRepository;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RegistroEntradaSalidaService {

    @Autowired
    private RegistroEntradaSalidaRepository registroRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private OficinaRepository oficinaRepository;

    public RegistroEntradaSalida registrarEntrada(Integer personaId, Integer oficinaId,
                                                  LocalDateTime fechaHora, String observaciones,
                                                  String usuarioRegistro) throws Exception {

        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new Exception("Persona no encontrada"));
        Oficina oficina = oficinaRepository.findById(oficinaId)
                .orElseThrow(() -> new Exception("Oficina no encontrada"));

        Boolean yaEstaEnOficina = registroRepository.estaPersonaEnOficina(personaId, oficinaId);
        if (yaEstaEnOficina) {
            throw new Exception("La persona ya se encuentra en la oficina " + oficina.getNombre());
        }

        if (oficina.getCapacidadMaxima() != null) {
            Long personasActuales = registroRepository.contarPersonasEnOficina(oficinaId);
            if (personasActuales >= oficina.getCapacidadMaxima()) {
                throw new Exception("La oficina " + oficina.getNombre() +
                        " ha alcanzado su capacidad máxima (" + oficina.getCapacidadMaxima() +
                        " personas). Actualmente hay " + personasActuales + " personas.");
            }
        }

        LocalDateTime fechaFinal = fechaHora != null ? fechaHora : LocalDateTime.now();

        RegistroEntradaSalida registro = new RegistroEntradaSalida(
                persona, oficina, RegistroEntradaSalida.TipoMovimiento.ENTRADA,
                fechaFinal, observaciones, usuarioRegistro);

        return registroRepository.save(registro);
    }

    public RegistroEntradaSalida registrarSalida(Integer personaId, Integer oficinaId,
                                                 LocalDateTime fechaHora, String observaciones,
                                                 String usuarioRegistro) throws Exception {

        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new Exception("Persona no encontrada"));
        Oficina oficina = oficinaRepository.findById(oficinaId)
                .orElseThrow(() -> new Exception("Oficina no encontrada"));

        Boolean estaEnOficina = registroRepository.estaPersonaEnOficina(personaId, oficinaId);
        if (!estaEnOficina) {
            throw new Exception("No se puede registrar salida: " + persona.getNombre() +
                    " no se encuentra actualmente en la oficina " + oficina.getNombre());
        }

        LocalDateTime fechaFinal = fechaHora != null ? fechaHora : LocalDateTime.now();

        RegistroEntradaSalida registro = new RegistroEntradaSalida(
                persona, oficina, RegistroEntradaSalida.TipoMovimiento.SALIDA,
                fechaFinal, observaciones, usuarioRegistro);

        return registroRepository.save(registro);
    }

    public Page<RegistroEntradaSalida> obtenerRegistrosConFiltros(
            Integer personaId, Integer oficinaId, RegistroEntradaSalida.TipoMovimiento tipoMovimiento,
            LocalDateTime fechaDesde, LocalDateTime fechaHasta, Pageable pageable) {

        return registroRepository.findWithFilters(personaId, oficinaId, tipoMovimiento,
                fechaDesde, fechaHasta, pageable);
    }

    public List<RegistroEntradaSalida> obtenerTodosLosRegistrosConFiltros(
            Integer personaId, Integer oficinaId, RegistroEntradaSalida.TipoMovimiento tipoMovimiento,
            LocalDateTime fechaDesde, LocalDateTime fechaHasta) {

        return registroRepository.findAllWithFilters(personaId, oficinaId, tipoMovimiento,
                fechaDesde, fechaHasta);
    }

    public List<Persona> obtenerPersonasEnOficina(Integer oficinaId) {
        return registroRepository.findPersonasEnOficina(oficinaId);
    }

    public Long contarPersonasEnOficina(Integer oficinaId) {
        return registroRepository.contarPersonasEnOficina(oficinaId);
    }

    public String obtenerEstadoPersona(Integer personaId) {
        Optional<RegistroEntradaSalida> ultimoRegistro = registroRepository.findUltimoRegistroByPersona(personaId);

        if (ultimoRegistro.isEmpty()) {
            return "Sin registros";
        }

        RegistroEntradaSalida registro = ultimoRegistro.get();

        if (registro.getTipoMovimiento() == RegistroEntradaSalida.TipoMovimiento.ENTRADA) {
            return "En " + registro.getOficina().getNombre() + " desde " + registro.getFechaHora();
        } else {
            return "Fuera de oficina desde " + registro.getFechaHora();
        }
    }

    public Page<RegistroEntradaSalida> obtenerHistorialPersona(Integer personaId, Pageable pageable) {
        return registroRepository.findByPersonaOrderByFechaHoraDesc(personaId, pageable);
    }

    public OficinaEstadisticas obtenerEstadisticasOficina(Integer oficinaId) {
        Oficina oficina = oficinaRepository.findById(oficinaId).orElse(null);
        if (oficina == null) return null;

        Long personasActuales = contarPersonasEnOficina(oficinaId);
        List<Persona> personas = obtenerPersonasEnOficina(oficinaId);

        return new OficinaEstadisticas(oficina, personasActuales, personas);
    }

    public static class OficinaEstadisticas {
        private Oficina oficina;
        private Long personasActuales;
        private List<Persona> personas;
        private Double porcentajeOcupacion;

        public OficinaEstadisticas(Oficina oficina, Long personasActuales, List<Persona> personas) {
            this.oficina = oficina;
            this.personasActuales = personasActuales;
            this.personas = personas;

            if (oficina.getCapacidadMaxima() != null && oficina.getCapacidadMaxima() > 0) {
                this.porcentajeOcupacion = (personasActuales.doubleValue() / oficina.getCapacidadMaxima()) * 100;
            } else {
                this.porcentajeOcupacion = 0.0;
            }
        }

        public Oficina getOficina() { return oficina; }
        public Long getPersonasActuales() { return personasActuales; }
        public List<Persona> getPersonas() { return personas; }
        public Double getPorcentajeOcupacion() { return porcentajeOcupacion; }
    }
}