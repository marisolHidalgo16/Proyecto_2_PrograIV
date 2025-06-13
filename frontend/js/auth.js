async function login(event) {
    event.preventDefault();

    let form = event.target;
    if(!form.checkValidity()){
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    mostrarIndicadorLogin(true);

    try {
        const respuesta = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || "Credenciales incorrectas");
        }

        const data = await respuesta.json();

        localStorage.setItem("jwt", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        console.log("✅ Login exitoso:", data);

        mostrarMensajeLogin('success', '¡Bienvenido! Redirigiendo...');

        setTimeout(() => {
            redirectBasedOnRole(data.role);
        }, 1500);

    } catch (error) {
        console.error("❌ Error en login:", error);
        mostrarMensajeLogin('error', error.message);
    } finally {
        mostrarIndicadorLogin(false);
    }
}

function redirectBasedOnRole(role) {
    console.log(`🔄 Redirigiendo usuario con rol: ${role}`);

    switch (role) {
        case "ROLE_ADMINISTRADOR":
            console.log("👑 Administrador: acceso completo");
            window.location.href = "personaIndex.html";
            break;
        case "ROLE_REGISTRADOR":
            console.log("📝 Registrador: acceso a registros");
            window.location.href = "registrosIndex.html";
            break;
        case "ROLE_VISOR":
            console.log("👁️ Visor: acceso de solo lectura");
            window.location.href = "personaIndex.html";
            break;
        default:
            console.log("❓ Rol desconocido, redirigir a personas");
            window.location.href = "personaIndex.html";
            break;
    }
}

function logout() {
    console.log('🚪 Cerrando sesión...');

    mostrarMensajeLogin('info', 'Cerrando sesión...');

    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    if (typeof permissionManager !== 'undefined') {
        permissionManager.userPermissions = null;
    }

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

function mostrarIndicadorLogin(mostrar) {
    const submitBtn = document.querySelector('button[type="submit"]');
    const form = document.querySelector('form');

    if (mostrar) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Iniciando sesión...
            `;
        }
        if (form) {
            form.style.opacity = '0.7';
        }
    } else {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                Iniciar sesión <i class="bi bi-door-open"></i>
            `;
        }
        if (form) {
            form.style.opacity = '1';
        }
    }
}

function mostrarMensajeLogin(tipo, mensaje) {
    // Remover mensaje anterior si existe
    const mensajeAnterior = document.getElementById('login-message');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'info': 'alert-info',
        'warning': 'alert-warning'
    };

    const iconClass = {
        'success': 'bi-check-circle',
        'error': 'bi-exclamation-triangle',
        'info': 'bi-info-circle',
        'warning': 'bi-exclamation-triangle'
    };

    const alertDiv = document.createElement('div');
    alertDiv.id = 'login-message';
    alertDiv.className = `alert ${alertClass[tipo]} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="bi ${iconClass[tipo]} me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(alertDiv, form);
    }

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

async function verificarAutenticacion() {
    if (typeof authGuard !== 'undefined') {
        await authGuard.checkAuthentication();
        return authGuard.isAuthenticated();
    } else {
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwt");
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function createAuthorizedFetch() {
    return async function(url, options = {}) {
        const token = localStorage.getItem("jwt");

        if (!token) {
            if (typeof authGuard !== 'undefined') {
                authGuard.redirectToLogin('No hay token de autenticación');
            } else {
                window.location.href = "login.html";
            }
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                console.log('🔒 Error 401: Token expirado o inválido');
                if (typeof authGuard !== 'undefined') {
                    authGuard.redirectToLogin('Sesión expirada');
                } else {
                    alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                    localStorage.removeItem("jwt");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    window.location.href = "login.html";
                }
                throw new Error('Token expirado');
            } else if (response.status === 403) {
                console.log('🚫 Error 403: Acceso prohibido');
                alert("No tienes permisos para realizar esta acción.");
                throw new Error('Acceso prohibido');
            }

            return response;

        } catch (error) {
            console.error('💥 Error en fetch autorizado:', error);
            throw error;
        }
    };
}

const authorizedFetch = createAuthorizedFetch();

function mostrarInfoUsuario() {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (username) {
        const nombreUsuarioElement = document.getElementById("nombreUsuario");
        if (nombreUsuarioElement) {
            nombreUsuarioElement.textContent = username;
        }
    }

    if (role) {
        let roleText = "";
        let roleIcon = "";

        switch(role) {
            case "ROLE_ADMINISTRADOR":
                roleText = "Administrador";
                roleIcon = "👑";
                break;
            case "ROLE_REGISTRADOR":
                roleText = "Registrador";
                roleIcon = "📝";
                break;
            case "ROLE_VISOR":
                roleText = "Visor";
                roleIcon = "👁️";
                break;
            default:
                roleText = role.replace("ROLE_", "");
                roleIcon = "👤";
        }

        const rolUsuarioElement = document.getElementById("rolUsuario");
        if (rolUsuarioElement) {
            rolUsuarioElement.innerHTML = `${roleIcon} ${roleText}`;
        }
    }
}

function verificarPermisosParaPagina(paginaRequerida, permisoRequerido) {
    const role = localStorage.getItem("role");

    if (!role) {
        if (typeof authGuard !== 'undefined') {
            authGuard.redirectToLogin('No hay información de rol');
        } else {
            window.location.href = "login.html";
        }
        return false;
    }

    switch (paginaRequerida) {
        case "personas":
            if (role === "ROLE_REGISTRADOR") {
                alert("No tienes permisos para acceder al módulo de personas.");
                window.location.href = "registrosIndex.html";
                return false;
            }
            break;

        case "oficinas":
            if (role === "ROLE_REGISTRADOR") {
                alert("No tienes permisos para acceder al módulo de oficinas.");
                window.location.href = "registrosIndex.html";
                return false;
            }
            break;

        case "reportes":
            if (role === "ROLE_REGISTRADOR") {
                alert("No tienes permisos para acceder a reportes y estadísticas.");
                window.location.href = "registrosIndex.html";
                return false;
            }
            break;
    }

    return true;
}

(function () {
    'use strict'

    var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()

document.addEventListener("DOMContentLoaded", function() {
    console.log('🔧 Iniciando sistema de autenticación...');

    mostrarInfoUsuario();

    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html') {
        console.log('📄 Página de login detectada');

        const token = localStorage.getItem("jwt");
        const role = localStorage.getItem("role");

        if (token && role) {
            console.log('🔄 Usuario ya autenticado, redirigiendo...');
            redirectBasedOnRole(role);
        }
    }

    console.log('✅ Sistema de autenticación inicializado');
});