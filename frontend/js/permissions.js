class PermissionManager {
    constructor() {
        this.userPermissions = null;
        this.currentRole = localStorage.getItem("role");
    }

    async loadUserPermissions() {
        const token = localStorage.getItem("jwt");

        if (!token) {
            console.warn("No hay token de autenticación");
            return false;
        }

        try {
            const response = await fetch('http://localhost:8080/api/user/permissions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.userPermissions = await response.json();
            console.log('Permisos cargados:', this.userPermissions);
            return true;

        } catch (error) {
            console.error('Error al cargar permisos:', error);
            return false;
        }
    }

    isAdmin() {
        return this.currentRole === "ROLE_ADMINISTRADOR";
    }

    isRegistrador() {
        return this.currentRole === "ROLE_REGISTRADOR";
    }

    isVisor() {
        return this.currentRole === "ROLE_VISOR";
    }

    canReadPersonas() {
        return this.userPermissions?.canReadPersonas || this.isAdmin() || this.isVisor();
    }

    canWritePersonas() {
        return this.userPermissions?.canWritePersonas || this.isAdmin();
    }

    canReadOficinas() {
        return this.userPermissions?.canReadOficinas || this.isAdmin() || this.isVisor();
    }

    canWriteOficinas() {
        return this.userPermissions?.canWriteOficinas || this.isAdmin();
    }

    canReadRegistros() {
        return this.userPermissions?.canReadRegistros || this.isAdmin() || this.isVisor() || this.isRegistrador();
    }

    canWriteRegistros() {
        return this.userPermissions?.canWriteRegistros || this.isAdmin() || this.isRegistrador();
    }

    canDeleteRegistros() {
        return this.userPermissions?.canDeleteRegistros || this.isAdmin();
    }

    canViewReports() {
        return this.userPermissions?.canViewReports || this.isAdmin() || this.isVisor();
    }

    applyVisualPermissions() {

        this.hideElementsBasedOnPermissions();

        this.configureNavigation();

        this.applyPageSpecificPermissions();
    }

    hideElementsBasedOnPermissions() {
        // PERSONAS - Botones de escritura
        if (!this.canWritePersonas()) {
            this.hideElements([
                'a[href="formPersona.html"]',
                '.btn-warning',
                '.btn-danger',
                'button[onclick*="editarPersona"]',
                'button[onclick*="eliminarPersona"]'
            ]);
        }

        if (!this.canWriteOficinas()) {
            this.hideElements([
                'a[href="formOficina.html"]',
                'button[onclick*="editarOficina"]',
                'button[onclick*="eliminarOficina"]'
            ]);
        }

        if (!this.canWriteRegistros()) {
            this.hideElements([
                'a[href="formRegistro.html"]',
                'button[onclick*="editarRegistro"]'
            ]);
        }

        if (!this.canDeleteRegistros()) {
            this.hideElements([
                'button[onclick*="eliminarRegistro"]'
            ]);
        }

        if (!this.canViewReports()) {
            this.hideElements([
                '#reportesDropdown',
                'a[href="reportesIndex.html"]',
                '.btn[onclick*="exportar"]'
            ]);
        }
    }

    configureNavigation() {
        const role = this.currentRole;

        if (this.isRegistrador()) {
            this.hideElements([
                '#personasDropdown',
                '#oficinasDropdown',
                '#reportesDropdown'
            ]);
        }

        if (this.isVisor()) {
            console.log("Usuario VISOR: Solo lectura habilitada");
        }

        if (this.isAdmin()) {
            console.log("Usuario ADMINISTRADOR: Acceso completo");
        }
    }

    applyPageSpecificPermissions() {
        const currentPage = window.location.pathname.split('/').pop();

        switch (currentPage) {
            case 'personaIndex.html':
                this.applyPersonasPermissions();
                break;
            case 'oficinaIndex.html':
                this.applyOficinasPermissions();
                break;
            case 'registrosIndex.html':
                this.applyRegistrosPermissions();
                break;
            case 'reportesIndex.html':
                this.applyReportesPermissions();
                break;
            case 'formPersona.html':
            case 'formOficina.html':
            case 'formRegistro.html':
                this.applyFormPermissions();
                break;
        }
    }

    applyPersonasPermissions() {
        if (!this.canReadPersonas()) {
            window.location.href = 'login.html';
            return;
        }

        if (!this.canWritePersonas()) {

            this.hideElements([
                'button[onclick="exportarPDF()"]',
                'button[onclick="exportarExcel()"]'
            ]);
        }
    }

    applyOficinasPermissions() {
        if (!this.canReadOficinas()) {
            window.location.href = 'login.html';
            return;
        }
    }

    applyRegistrosPermissions() {
        if (!this.canReadRegistros()) {
            window.location.href = 'login.html';
            return;
        }
    }

    applyReportesPermissions() {
        if (!this.canViewReports()) {
            alert("No tienes permisos para ver reportes y estadísticas.");
            window.location.href = 'personaIndex.html';
            return;
        }
    }

    applyFormPermissions() {
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage === 'formPersona.html' && !this.canWritePersonas()) {
            alert("No tienes permisos para crear/editar personas.");
            window.location.href = 'personaIndex.html';
            return;
        }

        if (currentPage === 'formOficina.html' && !this.canWriteOficinas()) {
            alert("No tienes permisos para crear/editar oficinas.");
            window.location.href = 'oficinaIndex.html';
            return;
        }

        if (currentPage === 'formRegistro.html' && !this.canWriteRegistros()) {
            alert("No tienes permisos para crear registros.");
            window.location.href = 'registrosIndex.html';
            return;
        }
    }

    hideElements(selectors) {
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
    }

    showElements(selectors) {
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = '';
            });
        });
    }

    disableElements(selectors) {
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.disabled = true;
                element.classList.add('disabled');
            });
        });
    }
}

const permissionManager = new PermissionManager();

async function initializePermissions() {
    console.log('Inicializando sistema de permisos...');

    const loaded = await permissionManager.loadUserPermissions();
    if (loaded) {
        permissionManager.applyVisualPermissions();
        console.log('Sistema de permisos inicializado correctamente');
    } else {
        console.warn('No se pudieron cargar los permisos del usuario');
    }
}

function checkPermissionBeforeAction(action, callback) {
    let hasPermission = false;

    switch (action) {
        case 'write-personas':
            hasPermission = permissionManager.canWritePersonas();
            break;
        case 'write-oficinas':
            hasPermission = permissionManager.canWriteOficinas();
            break;
        case 'write-registros':
            hasPermission = permissionManager.canWriteRegistros();
            break;
        case 'delete-registros':
            hasPermission = permissionManager.canDeleteRegistros();
            break;
        case 'view-reports':
            hasPermission = permissionManager.canViewReports();
            break;
        default:
            console.warn('Acción no reconocida:', action);
            return false;
    }

    if (hasPermission) {
        if (callback) callback();
        return true;
    } else {
        alert('No tienes permisos para realizar esta acción.');
        return false;
    }
}

function getCurrentUserRole() {
    return permissionManager.currentRole;
}

function isUserAdmin() {
    return permissionManager.isAdmin();
}

function isUserRegistrador() {
    return permissionManager.isRegistrador();
}

function isUserVisor() {
    return permissionManager.isVisor();
}