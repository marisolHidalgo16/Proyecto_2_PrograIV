package cr.ac.una.backendprogra.endpoint;

import cr.ac.una.backendprogra.dto.PersonaType;
import cr.ac.una.backendprogra.dto.OficinaType;
import cr.ac.una.backendprogra.entity.Persona;
import cr.ac.una.backendprogra.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.util.List;

@Endpoint
public class PersonaEndpoint {

    private static final String NAMESPACE_URI = "http://soapcrud.una.ac.cr/ws/persona";

    @Autowired
    private PersonaService personaService;

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getPersonasRequest")
    @ResponsePayload
    public GetPersonasResponse listarPersonas(@RequestPayload GetPersonasRequest request) {
        GetPersonasResponse response = new GetPersonasResponse();
        List<Persona> personas = personaService.listarPersonas();

        for (Persona persona : personas) {
            PersonaType personaType = new PersonaType();
            personaType.setId(persona.getIdAuto());
            personaType.setIdUsuario(persona.getIdUsuario());
            personaType.setNombre(persona.getNombre());
            personaType.setEmail(persona.getEmail());
            personaType.setDireccion(persona.getDireccion());

            if (persona.getFechaNacimiento() != null) {
                personaType.setFechaNacimiento(persona.getFechaNacimiento().toString());
            }

            if (persona.getOficina() != null) {
                OficinaType oficinaType = new OficinaType();
                oficinaType.setId(persona.getOficina().getIdOficina());
                oficinaType.setNombre(persona.getOficina().getNombre());
                oficinaType.setUbicacion(persona.getOficina().getUbicacion());
                oficinaType.setLatitud(persona.getOficina().getLatitud());
                oficinaType.setLongitud(persona.getOficina().getLongitud());
                oficinaType.setCapacidadMaxima(persona.getOficina().getCapacidadMaxima());
                personaType.setOficina(oficinaType);
            }

            response.getPersonas().add(personaType);
        }

        return response;
    }
}