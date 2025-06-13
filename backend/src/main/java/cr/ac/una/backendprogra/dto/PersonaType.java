package cr.ac.una.backendprogra.dto;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "PersonaType", propOrder = {
        "id",
        "idUsuario",
        "nombre",
        "email",
        "direccion"
})

public class PersonaType {
    private Integer id;
    private String idUsuario;
    private String nombre;
    private String email;
    private String direccion;
}
