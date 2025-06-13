package cr.ac.una.backendprogra.service;

import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    public List<Persona> listarPersonas() {
        return personaRepository.findAll();
    }
}