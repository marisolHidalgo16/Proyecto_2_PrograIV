package cr.ac.una.backendprogra.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    public String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().iterator().next().getAuthority();
        }
        return null;
    }

    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    public boolean isAdmin() {
        String role = getCurrentUserRole();
        return "ROLE_ADMINISTRADOR".equals(role);
    }

    public boolean isRegistrador() {
        String role = getCurrentUserRole();
        return "ROLE_REGISTRADOR".equals(role);
    }

    public boolean isVisor() {
        String role = getCurrentUserRole();
        return "ROLE_VISOR".equals(role);
    }

    public boolean canReadPersonas() {
        return isAdmin() || isVisor();
    }

    public boolean canWritePersonas() {
        return isAdmin();
    }

    public boolean canReadOficinas() {
        return isAdmin() || isVisor();
    }

    public boolean canWriteOficinas() {
        return isAdmin();
    }

    public boolean canReadRegistros() {
        return isAdmin() || isVisor() || isRegistrador();
    }

    public boolean canWriteRegistros() {
        return isAdmin() || isRegistrador();
    }

    public boolean canDeleteRegistros() {
        return isAdmin();
    }

    public boolean canViewReports() {
        return isAdmin() || isVisor();
    }


    public UserPermissionInfo getCurrentUserInfo() {
        return new UserPermissionInfo(
                getCurrentUsername(),
                getCurrentUserRole(),
                canReadPersonas(),
                canWritePersonas(),
                canReadOficinas(),
                canWriteOficinas(),
                canReadRegistros(),
                canWriteRegistros(),
                canDeleteRegistros(),
                canViewReports()
        );
    }

    public static class UserPermissionInfo {
        private String username;
        private String role;
        private boolean canReadPersonas;
        private boolean canWritePersonas;
        private boolean canReadOficinas;
        private boolean canWriteOficinas;
        private boolean canReadRegistros;
        private boolean canWriteRegistros;
        private boolean canDeleteRegistros;
        private boolean canViewReports;

        public UserPermissionInfo(String username, String role, boolean canReadPersonas,
                                  boolean canWritePersonas, boolean canReadOficinas,
                                  boolean canWriteOficinas, boolean canReadRegistros,
                                  boolean canWriteRegistros, boolean canDeleteRegistros,
                                  boolean canViewReports) {
            this.username = username;
            this.role = role;
            this.canReadPersonas = canReadPersonas;
            this.canWritePersonas = canWritePersonas;
            this.canReadOficinas = canReadOficinas;
            this.canWriteOficinas = canWriteOficinas;
            this.canReadRegistros = canReadRegistros;
            this.canWriteRegistros = canWriteRegistros;
            this.canDeleteRegistros = canDeleteRegistros;
            this.canViewReports = canViewReports;
        }

        public String getUsername() { return username; }
        public String getRole() { return role; }
        public boolean isCanReadPersonas() { return canReadPersonas; }
        public boolean isCanWritePersonas() { return canWritePersonas; }
        public boolean isCanReadOficinas() { return canReadOficinas; }
        public boolean isCanWriteOficinas() { return canWriteOficinas; }
        public boolean isCanReadRegistros() { return canReadRegistros; }
        public boolean isCanWriteRegistros() { return canWriteRegistros; }
        public boolean isCanDeleteRegistros() { return canDeleteRegistros; }
        public boolean isCanViewReports() { return canViewReports; }
    }
}