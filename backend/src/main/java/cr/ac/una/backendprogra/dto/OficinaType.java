package cr.ac.una.backendprogra.dto;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "OficinaType", propOrder = {
        "id",
        "nombre",
        "ubicacion",
        "latitud",
        "longitud",
        "capacidadMaxima"
})
public class OficinaType {
    private Integer id;
    private String nombre;
    private String ubicacion;
    private Double latitud;
    private Double longitud;
    private Integer capacidadMaxima;
}