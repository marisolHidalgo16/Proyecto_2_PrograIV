package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public List<Persona> obtenerTodas(){return personaRepository.findAll();
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