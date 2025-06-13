package cr.ac.una.backendprogra.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Oficina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idOficina;

    private String nombre;
    private String ubicacion;

    private Double latitud;
    private Double longitud;

    @Column(name = "capacidad_maxima")
    private Integer capacidadMaxima;
}