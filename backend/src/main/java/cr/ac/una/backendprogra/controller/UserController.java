package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private PermissionService permissionService;

    @GetMapping("/permissions")
    public ResponseEntity<Map<String, Object>> getCurrentUserPermissions() {
        try {
            PermissionService.UserPermissionInfo userInfo = permissionService.getCurrentUserInfo();

            if (userInfo.getUsername() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no autenticado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("username", userInfo.getUsername());
            response.put("role", userInfo.getRole());
            response.put("canReadPersonas", userInfo.isCanReadPersonas());
            response.put("canWritePersonas", userInfo.isCanWritePersonas());
            response.put("canReadOficinas", userInfo.isCanReadOficinas());
            response.put("canWriteOficinas", userInfo.isCanWriteOficinas());
            response.put("canReadRegistros", userInfo.isCanReadRegistros());
            response.put("canWriteRegistros", userInfo.isCanWriteRegistros());
            response.put("canDeleteRegistros", userInfo.isCanDeleteRegistros());
            response.put("canViewReports", userInfo.isCanViewReports());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener permisos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/can/{action}")
    public ResponseEntity<Map<String, Object>> canUserPerformAction(@PathVariable String action) {
        try {
            boolean canPerform = false;

            switch (action.toLowerCase()) {
                case "read-personas":
                    canPerform = permissionService.canReadPersonas();
                    break;
                case "write-personas":
                    canPerform = permissionService.canWritePersonas();
                    break;
                case "read-oficinas":
                    canPerform = permissionService.canReadOficinas();
                    break;
                case "write-oficinas":
                    canPerform = permissionService.canWriteOficinas();
                    break;
                case "read-registros":
                    canPerform = permissionService.canReadRegistros();
                    break;
                case "write-registros":
                    canPerform = permissionService.canWriteRegistros();
                    break;
                case "delete-registros":
                    canPerform = permissionService.canDeleteRegistros();
                    break;
                case "view-reports":
                    canPerform = permissionService.canViewReports();
                    break;
                default:
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Acción no reconocida: " + action);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("action", action);
            response.put("canPerform", canPerform);
            response.put("username", permissionService.getCurrentUsername());
            response.put("role", permissionService.getCurrentUserRole());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al verificar permisos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}