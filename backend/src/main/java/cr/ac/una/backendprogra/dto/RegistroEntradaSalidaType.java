package cr.ac.una.backendprogra.dto;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "RegistroEntradaSalidaType", propOrder = {
        "id",
        "personaNombre",
        "personaId",
        "oficinaNombre",
        "oficinaId",
        "tipoMovimiento",
        "fechaHora",
        "observaciones",
        "usuarioRegistro"
}, namespace = "http://soapcrud.una.ac.cr/ws/registro")
public class RegistroEntradaSalidaType {
    private Long id;
    private String personaNombre;
    private Integer personaId;
    private String oficinaNombre;
    private Integer oficinaId;
    private String tipoMovimiento;
    private String fechaHora;
    private String observaciones;
    private String usuarioRegistro;
}