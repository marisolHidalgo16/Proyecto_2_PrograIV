package cr.ac.una.backendprogra.endpoint;

import cr.ac.una.backendprogra.dto.OficinaType;
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
@XmlType(name = "GetOficinasResponse", propOrder = {"oficinas"})
@XmlRootElement(name = "getOficinasResponse")
public class GetOficinasResponse {

    @XmlElement(name = "oficina", required = true)
    private List<OficinaType> oficinas = new ArrayList<>();

    public List<OficinaType> getOficinas() {
        return oficinas;
    }

    public void setOficinas(List<OficinaType> oficinas) {
        this.oficinas = oficinas;
    }
}