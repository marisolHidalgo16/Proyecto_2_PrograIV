package cr.ac.una.backendprogra.endpoint;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Data;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetRegistrosRequest", namespace = "http://soapcrud.una.ac.cr/ws/registro")
@XmlRootElement(name = "getRegistrosRequest", namespace = "http://soapcrud.una.ac.cr/ws/registro")
public class GetRegistrosRequest {
}