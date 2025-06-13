class AuthGuard {
    constructor() {
        this.publicPages = ['login.html', 'index.html'];
        this.isAuthenticating = false;
        this.initializeAuthGuard();
    }

    initializeAuthGuard() {

        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthentication();
        });

        setInterval(() => {
            this.checkAuthenticationSilently();
        }, 300000); // 5 minutos

        window.addEventListener('beforeunload', () => {
            this.validateTokenBeforeUnload();
        });

        console.log('🛡️ AuthGuard inicializado correctamente');
    }

    isPublicPage() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.publicPages.includes(currentPage) || currentPage === '';
    }

    getAuthToken() {
        return localStorage.getItem('jwt');
    }

    hasUserData() {
        const token = this.getAuthToken();
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        return !!(token && username && role);
    }

    async checkAuthentication() {
        console.log('🔍 Verificando autenticación...');

        if (this.isPublicPage()) {
            console.log('📄 Página pública, no requiere autenticación');
            return;
        }

        if (this.isAuthenticating) {
            console.log('⏳ Autenticación en proceso...');
            return;
        }

        this.isAuthenticating = true;

        try {

            if (!this.hasUserData()) {
                console.log('❌ No hay datos de usuario, redirigiendo al login');
                this.redirectToLogin('No hay datos de autenticación');
                return;
            }

            const isValid = await this.validateTokenWithServer();

            if (!isValid) {
                console.log('❌ Token inválido, redirigiendo al login');
                this.redirectToLogin('Sesión expirada o inválida');
                return;
            }

            console.log('✅ Autenticación válida');

        } catch (error) {
            console.error('💥 Error en verificación de autenticación:', error);
            this.redirectToLogin('Error de conexión');
        } finally {
            this.isAuthenticating = false;
        }
    }

    async checkAuthenticationSilently() {
        if (this.isPublicPage()) return;

        try {
            const isValid = await this.validateTokenWithServer();
            if (!isValid) {
                console.log('🔄 Sesión expirada detectada en verificación silenciosa');
                this.clearAuthData();
            }
        } catch (error) {
            console.warn('⚠️ Error en verificación silenciosa:', error);
        }
    }

    async validateTokenWithServer() {
        const token = this.getAuthToken();

        if (!token) {
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

            return response.ok;

        } catch (error) {
            console.error('🌐 Error de conexión al validar token:', error);

            return true;
        }
    }

    clearAuthData() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        console.log('🧹 Datos de autenticación limpiados');
    }

    redirectToLogin(reason = 'Sesión expirada') {
        console.log(`🔄 Redirigiendo al login: ${reason}`);

        this.clearAuthData();

        if (reason !== 'No hay datos de autenticación') {
            this.showAuthMessage(reason);
        }

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    showAuthMessage(message) {

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning alert-dismissible fade show';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.left = '50%';
        alertDiv.style.transform = 'translateX(-50%)';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            <i class="bi bi-exclamation-triangle"></i>
            <strong>Atención:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }

    validateTokenBeforeUnload() {

        console.log('🚪 Página siendo cerrada...');
    }

    async forceAuthCheck() {
        this.isAuthenticating = false;
        await this.checkAuthentication();
    }

    isAuthenticated() {
        return this.hasUserData();
    }

    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        return {
            username: localStorage.getItem('username'),
            role: localStorage.getItem('role'),
            token: this.getAuthToken()
        };
    }
}

const authGuard = new AuthGuard();

async function verificarAutenticacion() {
    await authGuard.checkAuthentication();
    return authGuard.isAuthenticated();
}

function getCurrentUser() {
    return authGuard.getCurrentUser();
}

function isAuthenticated() {
    return authGuard.isAuthenticated();
}

async function forceAuthenticationCheck() {
    await authGuard.forceAuthCheck();
}

function requireAuth(callback) {
    if (authGuard.isAuthenticated()) {
        callback();
    } else {
        authGuard.redirectToLogin('Función requiere autenticación');
    }
}

console.log('🛡️ Sistema AuthGuard cargado correctamente');