package cr.ac.una.backendprogra.endpoint;

import cr.ac.una.backendprogra.dto.RegistroEntradaSalidaType;
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
@XmlType(name = "GetRegistrosResponse", propOrder = {"registros"}, namespace = "http://soapcrud.una.ac.cr/ws/registro")
@XmlRootElement(name = "getRegistrosResponse", namespace = "http://soapcrud.una.ac.cr/ws/registro")
public class GetRegistrosResponse {

    @XmlElement(name = "registro", required = true)
    private List<RegistroEntradaSalidaType> registros = new ArrayList<>();

    public List<RegistroEntradaSalidaType> getRegistros() {
        return registros;
    }

    public void setRegistros(List<RegistroEntradaSalidaType> registros) {
        this.registros = registros;
    }
}