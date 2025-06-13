package cr.ac.una.backendprogra.service;

import cr.ac.una.backendprogra.entity.Oficina;
import cr.ac.una.backendprogra.repository.OficinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OficinaService {

    @Autowired
    private OficinaRepository oficinaRepository;

    public List<Oficina> listarOficinas() {
        return oficinaRepository.findAll();
    }
}