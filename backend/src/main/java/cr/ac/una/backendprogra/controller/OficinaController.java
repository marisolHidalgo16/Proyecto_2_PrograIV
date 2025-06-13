package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/oficinas")
public class OficinaController {
    @Autowired
    private OficinaRepository oficinaRepository;

    @GetMapping
    public List<Oficina> obtenerTodas(){return oficinaRepository.findAll();
    }

    @PostMapping
    public Oficina crearOficina(@RequestBody Oficina oficina){
        return oficinaRepository.save(oficina);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Oficina> obtenerPorId(@PathVariable Integer id){
        Optional<Oficina> oficina = oficinaRepository.findById(id);
        if(oficina.isPresent()){
            return ResponseEntity.ok(oficina.get());
        }else{
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Oficina> actualizarOficina(@PathVariable Integer id, @RequestBody Oficina actualizada) {
        Optional<Oficina> oficina = oficinaRepository.findById(id);
        if (oficina.isPresent()) {
            oficina.get().setNombre(actualizada.getNombre());
            oficina.get().setUbicacion(actualizada.getUbicacion());
            oficinaRepository.save(oficina.get());
            return ResponseEntity.ok(oficina.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOficina(@PathVariable Integer id){
        if(oficinaRepository.existsById(id)){
            oficinaRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
