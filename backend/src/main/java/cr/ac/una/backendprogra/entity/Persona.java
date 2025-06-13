package cr.ac.una.backendprogra.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Persona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idAuto;

    private String idUsuario;
    private String nombre;
    private String email;
    private String direccion;
    private LocalDate fechaNacimiento;
    @ManyToOne
    private Oficina oficina;
}
