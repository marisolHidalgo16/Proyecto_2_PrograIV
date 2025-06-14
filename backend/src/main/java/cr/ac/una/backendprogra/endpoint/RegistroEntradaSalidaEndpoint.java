package cr.ac.una.backendprogra.endpoint;

import cr.ac.una.backendprogra.dto.RegistroEntradaSalidaType;
import cr.ac.una.backendprogra.entity.RegistroEntradaSalida;
import cr.ac.una.backendprogra.service.RegistroEntradaSalidaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Endpoint
public class RegistroEntradaSalidaEndpoint {

    private static final String NAMESPACE_URI = "http://soapcrud.una.ac.cr/ws/registro";
    private static final DateTimeFormatter FECHA_FORMATO = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private RegistroEntradaSalidaService registroService;

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "getRegistrosRequest")
    @ResponsePayload
    public GetRegistrosResponse listarRegistros(@RequestPayload GetRegistrosRequest request) {
        GetRegistrosResponse response = new GetRegistrosResponse();

        Page<RegistroEntradaSalida> registrosPage = registroService.obtenerRegistrosConFiltros(
                null, null, null, null, null, PageRequest.of(0, 50));
        List<RegistroEntradaSalida> registros = registrosPage.getContent();

        for (RegistroEntradaSalida registro : registros) {
            RegistroEntradaSalidaType registroType = new RegistroEntradaSalidaType();
            registroType.setId(registro.getId());
            registroType.setTipoMovimiento(registro.getTipoMovimiento().toString());
            registroType.setFechaHora(registro.getFechaHora().format(FECHA_FORMATO));
            registroType.setObservaciones(registro.getObservaciones());
            registroType.setUsuarioRegistro(registro.getUsuarioRegistro());

            if (registro.getPersona() != null) {
                registroType.setPersonaId(registro.getPersona().getIdAuto());
                registroType.setPersonaNombre(registro.getPersona().getNombre());
            }

            if (registro.getOficina() != null) {
                registroType.setOficinaId(registro.getOficina().getIdOficina());
                registroType.setOficinaNombre(registro.getOficina().getNombre());
            }

            response.getRegistros().add(registroType);
        }

        return response;
    }
}