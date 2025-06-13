package cr.ac.una.backendprogra.endpoint;

import cr.ac.una.backendprogra.dto.PersonaType;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetPersonasResponse", propOrder = {"personas"})
@XmlRootElement(name = "getPersonasResponse")


public class GetPersonasResponse {

    @XmlElement(name = "persona", required = true)
    private List<PersonaType> personas = new ArrayList<>();

    public List<PersonaType> getPersonas() {
        return personas;
    }

    public void setPersonas(List<PersonaType> personas) {
        this.personas = personas;
    }
}
