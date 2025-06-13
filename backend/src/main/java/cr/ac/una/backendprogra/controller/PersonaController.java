package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/personas")
public class PersonaController {
    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private OficinaRepository oficinaRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerPersonasPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "nombre") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) String idUsuario,
            @RequestParam(required = false) Integer oficinaId,
            @RequestParam(required = false) String fechaNacimiento) {

        try {
            // DEBUGGING - Imprimir todos los parámetros recibidos
            System.out.println("=== PARÁMETROS RECIBIDOS ===");
            System.out.println("nombre: '" + nombre + "'");
            System.out.println("email: '" + email + "'");
            System.out.println("direccion: '" + direccion + "'");
            System.out.println("idUsuario: '" + idUsuario + "'");
            System.out.println("oficinaId: " + oficinaId);
            System.out.println("fechaNacimiento: '" + fechaNacimiento + "'");
            System.out.println("page: " + page);
            System.out.println("size: " + size);
            System.out.println("sortBy: '" + sortBy + "'");
            System.out.println("sortDirection: '" + sortDirection + "'");
            System.out.println("==============================");

            Sort sort = Sort.by(sortDirection.equals("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);

            // CORRECCIÓN: Convertir strings vacíos a null para que funcione la query
            nombre = (nombre != null && nombre.trim().isEmpty()) ? null : nombre;
            email = (email != null && email.trim().isEmpty()) ? null : email;
            direccion = (direccion != null && direccion.trim().isEmpty()) ? null : direccion;
            idUsuario = (idUsuario != null && idUsuario.trim().isEmpty()) ? null : idUsuario;

            // Parsear fecha de nacimiento si existe
            LocalDate fechaNacimientoDate = null;
            if (fechaNacimiento != null && !fechaNacimiento.trim().isEmpty()) {
                fechaNacimientoDate = LocalDate.parse(fechaNacimiento, DateTimeFormatter.ISO_LOCAL_DATE);
            }

            // DEBUGGING - Verificar parámetros después de limpieza
            System.out.println("=== DESPUÉS DE LIMPIEZA ===");
            System.out.println("nombre: " + nombre);
            System.out.println("email: " + email);
            System.out.println("direccion: " + direccion);
            System.out.println("idUsuario: " + idUsuario);
            System.out.println("fechaNacimientoDate: " + fechaNacimientoDate);
            System.out.println("============================");

            // Llamar al repository con fecha de nacimiento específica
            Page<Persona> pagePersonas = personaRepository.findWithFilters(
                    nombre, email, direccion, idUsuario, oficinaId,
                    fechaNacimientoDate, fechaNacimientoDate, pageable); // Usar la misma fecha para desde y hasta

            // DEBUGGING - Verificar resultados
            System.out.println("Total encontrado: " + pagePersonas.getTotalElements());
            System.out.println("Contenido página: " + pagePersonas.getContent().size());

            Map<String, Object> response = new HashMap<>();
            response.put("personas", pagePersonas.getContent());
            response.put("currentPage", pagePersonas.getNumber());
            response.put("totalItems", pagePersonas.getTotalElements());
            response.put("totalPages", pagePersonas.getTotalPages());
            response.put("hasNext", pagePersonas.hasNext());
            response.put("hasPrevious", pagePersonas.hasPrevious());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR en obtenerPersonasPaginadas: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error al obtener personas: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public List<Persona> obtenerTodas(){
        return personaRepository.findAll();
    }

    @PostMapping
    public Persona crearPersona(@RequestBody Persona persona){
        Persona personaGuardada = personaRepository.save(persona);
        Oficina oficinaGuardada = oficinaRepository.findById(persona.getOficina().getIdOficina()).orElse(null);
        personaGuardada.setOficina(oficinaGuardada);
        return personaGuardada;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Persona> obtenerPorId(@PathVariable Integer id){
        Optional<Persona> persona = personaRepository.findById(id);
        if(persona.isPresent()){
            return ResponseEntity.ok(persona.get());
        }else{
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Persona> actualizarPersona(@PathVariable Integer id, @RequestBody Persona actualizada) {
        Optional<Persona> persona = personaRepository.findById(id);
        if (persona.isPresent()) {
            persona.get().setIdUsuario(actualizada.getIdUsuario());
            persona.get().setNombre(actualizada.getNombre());
            persona.get().setEmail(actualizada.getEmail());
            persona.get().setDireccion(actualizada.getDireccion());
            persona.get().setFechaNacimiento(actualizada.getFechaNacimiento());
            persona.get().setOficina(actualizada.getOficina());
            Oficina oficinaGuardada = oficinaRepository.findById(actualizada.getOficina().getIdOficina()).orElse(null);
            persona.get().setOficina(oficinaGuardada);
            personaRepository.save(persona.get());
            return ResponseEntity.ok(persona.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPersona(@PathVariable Integer id){
        if(personaRepository.existsById(id)){
            personaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}