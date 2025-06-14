let paginaActualRegistros = 0;
let totalPaginasRegistros = 0;
const tamanoPaginaRegistros = 5;
let permisosUsuario = null;
let registrosData = [];

document.addEventListener("DOMContentLoaded", async function() {

    const isAuth = await verificarAutenticacion();
    if (!isAuth) return;

    await cargarPermisosUsuario();

    aplicarPermisosVisuales();

    if (document.getElementById("registros-list")) {

        await cargarRegistros();
    } else if (document.getElementById("persona")) {

        await cargarPersonasCombo();
        await cargarOficinasCombo();
        actualizarFechaHora();
    }

    console.log('Módulo de registros inicializado correctamente');
});

async function cargarPermisosUsuario() {
    try {
        const response = await authorizedFetch('http://localhost:8080/api/user/permissions');
        if (response && response.ok) {
            permisosUsuario = await response.json();
            console.log('Permisos de usuario cargados:', permisosUsuario);
        }
    } catch (error) {
        console.error('Error al cargar permisos:', error);
    }
}

function aplicarPermisosVisuales() {
    const role = localStorage.getItem("role");

    if (role === "ROLE_VISOR") {

        ocultarElementos([
            'a[href="formRegistro.html"]',
            '.btn-primary[href="formRegistro.html"]'
        ]);

        mostrarMensajeInfoPermisos("Modo de solo lectura - No puedes crear registros de entrada/salida");
    }

    if (role === "ROLE_REGISTRADOR") {
        console.log('Usuario registrador: acceso completo a registros');
    }

    if (role === "ROLE_ADMINISTRADOR") {
        console.log('Usuario administrador: acceso completo a registros');
    }
}

function ocultarElementos(selectores) {
    selectores.forEach(selector => {
        const elementos = document.querySelectorAll(selector);
        elementos.forEach(elemento => {
            elemento.style.display = 'none';
        });
    });
}

function mostrarMensajeInfoPermisos(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info alert-dismissible fade show mb-3';
    alertDiv.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        <strong>Información:</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    if (container && container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild.nextSibling);
    }
}

function mostrarCargandoRegistros() {
    const tbody = document.getElementById("registros-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 mb-0">Cargando registros...</p>
                </td>
            </tr>
        `;
    }
}

async function cargarRegistros(pagina = 0) {
    mostrarCargandoRegistros();

    const params = new URLSearchParams();
    params.append('page', pagina);
    params.append('size', tamanoPaginaRegistros);
    params.append('sortBy', 'fechaHora');
    params.append('sortDirection', 'desc');

    console.log('Cargando registros, página:', pagina);

    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/registros?${params.toString()}`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const resultado = await respuesta.json();
        console.log('Resultado registros obtenido:', resultado);

        registrosData = resultado.registros;
        mostrarRegistros(resultado);
        actualizarPaginacionRegistros(resultado);

    } catch (error) {
        console.error('Error al cargar registros:', error);
        mostrarErrorEnTablaRegistros();
        mostrarNotificacion('Error al cargar registros. Verifique su conexión.', 'error');
    }
}

function mostrarErrorEnTablaRegistros() {
    const tbody = document.getElementById("registros-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al cargar los registros</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                    <br>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="cargarRegistros(${paginaActualRegistros})">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function mostrarRegistros(resultado) {
    const tbody = document.getElementById("registros-list");
    const totalElement = document.getElementById("total-registros");

    if (totalElement) {
        totalElement.textContent = `${resultado.totalItems} registro${resultado.totalItems !== 1 ? 's' : ''}`;
    }

    if (!tbody) return;

    tbody.innerHTML = "";

    if (resultado.registros.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">No hay registros disponibles</p>
                    <small class="text-muted">Los registros aparecerán aquí cuando se agreguen</small>
                </td>
            </tr>
        `;
        return;
    }

    resultado.registros.forEach((registro) => {
        const fechaFormateada = formatearFechaHora(registro.fechaHora);
        const tipoClass = registro.tipoMovimiento === 'ENTRADA' ? 'success' : 'danger';
        const tipoIcon = registro.tipoMovimiento === 'ENTRADA' ? 'box-arrow-in-right' : 'box-arrow-right';

        let fila = `<tr>
            <td><strong>${registro.id}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-person-circle text-primary me-2"></i>
                    <div>
                        <strong>${registro.persona.nombre}</strong><br>
                        <small class="text-muted">${registro.persona.idUsuario}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-info">
                    <i class="bi bi-building me-1"></i>${registro.oficina.nombre}
                </span>
            </td>
            <td class="text-center">
                <span class="badge bg-${tipoClass}">
                    <i class="bi bi-${tipoIcon} me-1"></i>${registro.tipoMovimiento}
                </span>
            </td>
            <td>
                <strong>
                    <i class="bi bi-clock me-1"></i>${fechaFormateada}
                </strong>
            </td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

function actualizarPaginacionRegistros(resultado) {
    paginaActualRegistros = resultado.currentPage;
    totalPaginasRegistros = resultado.totalPages;
    crearPaginacionRegistros();
}

function crearPaginacionRegistros() {
    const paginacionContainer = document.getElementById("paginacion-registros");
    if (!paginacionContainer || totalPaginasRegistros <= 1) {
        if (paginacionContainer) paginacionContainer.innerHTML = "";
        return;
    }

    let paginacionHtml = '<nav aria-label="Paginación de registros"><ul class="pagination justify-content-center">';

    paginacionHtml += `
        <li class="page-item ${paginaActualRegistros === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaRegistros(${paginaActualRegistros - 1}); return false;">
                <i class="bi bi-chevron-left"></i> Anterior
            </a>
        </li>
    `;

    const inicio = Math.max(0, paginaActualRegistros - 2);
    const fin = Math.min(totalPaginasRegistros - 1, paginaActualRegistros + 2);

    for (let i = inicio; i <= fin; i++) {
        paginacionHtml += `
            <li class="page-item ${i === paginaActualRegistros ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPaginaRegistros(${i}); return false;">${i + 1}</a>
            </li>
        `;
    }

    paginacionHtml += `
        <li class="page-item ${paginaActualRegistros === totalPaginasRegistros - 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaRegistros(${paginaActualRegistros + 1}); return false;">
                Siguiente <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    paginacionHtml += '</ul></nav>';
    paginacionContainer.innerHTML = paginacionHtml;
}

function cambiarPaginaRegistros(pagina) {
    if (pagina >= 0 && pagina < totalPaginasRegistros) {
        cargarRegistros(pagina);
    }
}

async function cargarPersonasCombo() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/personas/all');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const personas = await respuesta.json();
        const select = document.getElementById("persona");

        if (select) {
            select.innerHTML = '<option value="">Seleccionar persona...</option>';
            personas.forEach(persona => {
                const option = document.createElement('option');
                option.value = persona.idAuto;
                option.textContent = `${persona.nombre} - ${persona.idUsuario}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarNotificacion('Error al cargar la lista de personas', 'error');
    }
}

async function cargarOficinasCombo() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/oficinas');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const oficinas = await respuesta.json();
        const select = document.getElementById("oficina");

        if (select) {
            select.innerHTML = '<option value="">Seleccionar oficina...</option>';
            oficinas.forEach(oficina => {
                const option = document.createElement('option');
                option.value = oficina.idOficina;
                option.textContent = `${oficina.nombre} ${oficina.capacidadMaxima ? `(Cap: ${oficina.capacidadMaxima})` : ''}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
        mostrarNotificacion('Error al cargar la lista de oficinas', 'error');
    }
}

async function verificarEstadoPersona() {
    const personaId = document.getElementById("persona").value;
    const infoEstado = document.getElementById("info-estado");
    const estadoTexto = document.getElementById("estado-texto");

    if (!personaId) {
        if (infoEstado) infoEstado.style.display = "none";
        return;
    }

    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/registros/persona/${personaId}/estado`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const resultado = await respuesta.json();

        if (infoEstado && estadoTexto) {
            estadoTexto.textContent = `Estado actual: ${resultado.estado}`;
            infoEstado.style.display = "block";
        }

    } catch (error) {
        console.error('Error al verificar estado:', error);
        if (infoEstado) infoEstado.style.display = "none";
    }
}

async function verificarCapacidadOficina() {
    const oficinaId = document.getElementById("oficina").value;
    const infoCapacidad = document.getElementById("info-capacidad");
    const capacidadTexto = document.getElementById("capacidad-texto");

    if (!oficinaId) {
        if (infoCapacidad) infoCapacidad.style.display = "none";
        return;
    }

    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/registros/oficina/${oficinaId}/personas`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const resultado = await respuesta.json();

        if (infoCapacidad && capacidadTexto) {
            capacidadTexto.textContent = `Personas actualmente en la oficina: ${resultado.total}`;
            infoCapacidad.style.display = "block";
        }

    } catch (error) {
        console.error('Error al verificar capacidad:', error);
        if (infoCapacidad) infoCapacidad.style.display = "none";
    }
}

async function procesarRegistro(event) {
    event.preventDefault();

    const role = localStorage.getItem("role");

    if (role === "ROLE_VISOR") {
        mostrarNotificacion('No tienes permisos para crear registros.', 'error');
        return;
    }

    let form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const personaId = parseInt(document.getElementById("persona").value);
    const oficinaId = parseInt(document.getElementById("oficina").value);
    const tipoMovimiento = document.getElementById("tipoMovimiento").value;
    const fechaHora = document.getElementById("fechaHora").value;

    try {
        const endpoint = tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida';

        mostrarNotificacion('Procesando registro...', 'info');

        const respuesta = await authorizedFetch(`http://localhost:8080/api/registros/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify({
                personaId: personaId,
                oficinaId: oficinaId,
                fechaHora: fechaHora,
                observaciones: null
            })
        });

        if (!respuesta || !respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.message || 'Error al procesar el registro');
        }

        const resultado = await respuesta.json();

        if (!resultado.success) {
            throw new Error(resultado.message || 'Error al procesar el registro');
        }

        mostrarNotificacion(resultado.message, 'success');

        limpiarFormulario();

        setTimeout(() => {
            window.location.href = "registrosIndex.html";
        }, 2000);

    } catch (error) {
        console.error('Error al procesar registro:', error);
        mostrarNotificacion(error.message, 'error');
    }
}

function limpiarFormulario() {
    const campos = ['persona', 'oficina', 'tipoMovimiento'];

    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = "";
    });

    const fechaHora = document.getElementById("fechaHora");
    if (fechaHora) {
        actualizarFechaHora();
    }

    const infoEstado = document.getElementById("info-estado");
    const infoCapacidad = document.getElementById("info-capacidad");

    if (infoEstado) infoEstado.style.display = "none";
    if (infoCapacidad) infoCapacidad.style.display = "none";

    document.querySelectorAll('.was-validated').forEach(el => {
        el.classList.remove('was-validated');
    });
}

function actualizarFechaHora() {
    const ahora = new Date();
    const fechaHoraString = ahora.toISOString().slice(0, 16);
    const fechaHoraInput = document.getElementById('fechaHora');
    if (fechaHoraInput) {
        fechaHoraInput.value = fechaHoraString;
    }
}

function formatearFechaHora(fechaHoraString) {
    try {
        const fecha = new Date(fechaHoraString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return fechaHoraString;
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacionAnterior = document.getElementById('notificacion-temporal');
    if (notificacionAnterior) {
        notificacionAnterior.remove();
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
    alertDiv.id = 'notificacion-temporal';
    alertDiv.className = `alert ${alertClass[tipo]} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
    `;
    alertDiv.innerHTML = `
        <i class="bi ${iconClass[tipo]} me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function mostrarEstadisticasRapidas() {
    const totalRegistros = document.getElementById("total-registros")?.textContent || "0 registros";
    mostrarNotificacion(`📊 Estadísticas rápidas:\n\n${totalRegistros} en el sistema\n\n¡Panel de estadísticas avanzadas disponible en el menú!`, 'info');
}

window.cargarRegistros = cargarRegistros;
window.cambiarPaginaRegistros = cambiarPaginaRegistros;
window.cargarPersonasCombo = cargarPersonasCombo;
window.cargarOficinasCombo = cargarOficinasCombo;
window.verificarEstadoPersona = verificarEstadoPersona;
window.verificarCapacidadOficina = verificarCapacidadOficina;
window.procesarRegistro = procesarRegistro;
window.limpiarFormulario = limpiarFormulario;
window.actualizarFechaHora = actualizarFechaHora;
window.mostrarEstadisticasRapidas = mostrarEstadisticasRapidas;