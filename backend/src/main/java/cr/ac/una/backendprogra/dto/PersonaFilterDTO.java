package cr.ac.una.backendprogra.dto;

import lombok.Data;

@Data
public class PersonaFilterDTO {
    private String nombre;
    private String email;
    private String direccion;
    private String idUsuario;
    private Integer oficinaId;
    private String fechaDesde;
    private String fechaHasta;

    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "idAuto";
    private String sortDirection = "asc";
}
