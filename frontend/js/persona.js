let paginaActualPersonas = 0;
let totalPaginasPersonas = 0;
const tamanoPaginaPersonas = 5;
let permisosUsuario = null;
let personasData = [];

document.addEventListener("DOMContentLoaded", async function() {

    const isAuth = await verificarAutenticacion();
    if (!isAuth) return;

    await cargarPermisosUsuario();

    aplicarPermisosVisuales();

    if (document.getElementById("personas-list")) {

        await cargarOficinasFiltro();
        await cargarPersonas();
        inicializarFiltros();
    } else if (document.getElementById("nombre")) {

        await cargarPersonaParaEditar();
    }

    if (document.getElementById("personas-list")) {
        localStorage.removeItem("editIndex");
    }

    console.log('Módulo de personas inicializado correctamente');
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

    if (role === "ROLE_REGISTRADOR") {
        alert("No tienes permisos para acceder al módulo de personas.");
        window.location.href = "registrosIndex.html";
        return;
    }

    if (role === "ROLE_VISOR") {
        ocultarElementos([
            'a[href="formPersona.html"]',
            '.btn-warning', // Botones editar
            '.btn-danger',  // Botones eliminar
            'button[onclick*="editarPersona"]',
            'button[onclick*="eliminarPersona"]',
            'button[onclick="exportarPDF()"]',
            'button[onclick="exportarExcel()"]'
        ]);

        mostrarMensajeInfoPermisos("Modo de solo lectura - No puedes crear, editar, eliminar o exportar personas");
    }

    if (role === "ROLE_ADMINISTRADOR") {

        console.log('Usuario administrador: acceso completo habilitado');
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

function mostrarCargando() {
    const tbody = document.getElementById("personas-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 mb-0">Cargando personas...</p>
                </td>
            </tr>
        `;
    }
}

async function cargarPersonas(pagina = 0) {
    mostrarCargando();

    const filtros = obtenerFiltros();
    filtros.page = pagina;
    filtros.size = tamanoPaginaPersonas;

    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== '' && filtros[key] !== undefined) {
            params.append(key, filtros[key]);
        }
    });

    console.log('Parámetros enviados:', params.toString());

    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/personas?${params.toString()}`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const resultado = await respuesta.json();
        console.log('Resultado obtenido:', resultado);

        personasData = resultado.personas;
        mostrarPersonas(resultado);
        actualizarPaginacion(resultado);

    } catch (error) {
        console.error('Error al cargar personas:', error);
        mostrarErrorEnTabla();
        mostrarNotificacion('Error al cargar personas. Verifique su conexión.', 'error');
    }
}

function mostrarErrorEnTabla() {
    const tbody = document.getElementById("personas-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al cargar las personas</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                    <br>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="cargarPersonas(${paginaActualPersonas})">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function obtenerFiltros() {
    const filtros = {
        nombre: document.getElementById("filtroNombre")?.value?.trim() || '',
        email: document.getElementById("filtroEmail")?.value?.trim() || '',
        direccion: document.getElementById("filtroDireccion")?.value?.trim() || '',
        idUsuario: document.getElementById("filtroIdUsuario")?.value?.trim() || '',
        oficinaId: document.getElementById("filtroOficina")?.value || '',
        fechaNacimiento: document.getElementById("fechaNacimiento")?.value || '',
        sortBy: 'nombre',
        sortDirection: 'asc'
    };

    console.log('Filtros obtenidos:', filtros);
    return filtros;
}

function mostrarPersonas(resultado) {
    const tbody = document.getElementById("personas-list");
    const totalElement = document.getElementById("total-personas");
    const role = localStorage.getItem("role");

    if (totalElement) {
        totalElement.textContent = `${resultado.totalItems} persona${resultado.totalItems !== 1 ? 's' : ''}`;
    }

    if (!tbody) return;

    tbody.innerHTML = "";

    if (resultado.personas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">No se encontraron personas con los filtros aplicados</p>
                    <small class="text-muted">Intenta ajustar los criterios de búsqueda</small>
                </td>
            </tr>
        `;
        return;
    }

    resultado.personas.forEach((persona) => {
        let oficinaNombre = persona.oficina ? persona.oficina.nombre : 'Sin oficina';

        let botonesAccion = '';
        if (role === "ROLE_ADMINISTRADOR") {
            botonesAccion = `
                <div class="btn-group" role="group">
                    <button onclick="editarPersona(${persona.idAuto})" class="btn btn-warning btn-sm" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="eliminarPersona(${persona.idAuto})" class="btn btn-danger btn-sm" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        } else {
            botonesAccion = `
                <span class="text-muted">
                    <i class="bi bi-eye"></i> Solo lectura
                </span>
            `;
        }

        let fila = `<tr>
            <td><strong>${persona.idAuto}</strong></td>
            <td><span class="badge bg-secondary">${persona.idUsuario}</span></td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-person-circle text-primary me-2"></i>
                    <strong>${persona.nombre}</strong>
                </div>
            </td>
            <td>
                <a href="mailto:${persona.email}" class="text-decoration-none">
                    <i class="bi bi-envelope me-1"></i>${persona.email}
                </a>
            </td>
            <td>
                <small class="text-muted">
                    <i class="bi bi-geo-alt me-1"></i>${persona.direccion}
                </small>
            </td>
            <td>
                <span class="badge bg-info text-dark">
                    <i class="bi bi-calendar-date me-1"></i>${persona.fechaNacimiento || 'N/A'}
                </span>
            </td>
            <td>
                <span class="badge bg-success">
                    <i class="bi bi-building me-1"></i>${oficinaNombre}
                </span>
            </td>
            <td class="text-center">
                ${botonesAccion}
            </td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

function actualizarPaginacion(resultado) {
    paginaActualPersonas = resultado.currentPage;
    totalPaginasPersonas = resultado.totalPages;
    crearPaginacionPersonas();
}

function crearPaginacionPersonas() {
    const paginacionContainer = document.getElementById("paginacion-personas");
    if (!paginacionContainer || totalPaginasPersonas <= 1) {
        if (paginacionContainer) paginacionContainer.innerHTML = "";
        return;
    }

    let paginacionHtml = '<nav aria-label="Paginación de personas"><ul class="pagination justify-content-center">';

    paginacionHtml += `
        <li class="page-item ${paginaActualPersonas === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaPersonas(${paginaActualPersonas - 1}); return false;">
                <i class="bi bi-chevron-left"></i> Anterior
            </a>
        </li>
    `;

    const inicio = Math.max(0, paginaActualPersonas - 2);
    const fin = Math.min(totalPaginasPersonas - 1, paginaActualPersonas + 2);

    for (let i = inicio; i <= fin; i++) {
        paginacionHtml += `
            <li class="page-item ${i === paginaActualPersonas ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPaginaPersonas(${i}); return false;">${i + 1}</a>
            </li>
        `;
    }

    paginacionHtml += `
        <li class="page-item ${paginaActualPersonas === totalPaginasPersonas - 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaPersonas(${paginaActualPersonas + 1}); return false;">
                Siguiente <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;

    paginacionHtml += '</ul></nav>';
    paginacionContainer.innerHTML = paginacionHtml;
}

function cambiarPaginaPersonas(pagina) {
    if (pagina >= 0 && pagina < totalPaginasPersonas) {
        cargarPersonas(pagina);
    }
}

function aplicarFiltros() {
    console.log('Aplicando filtros...');
    paginaActualPersonas = 0;
    cargarPersonas(0);
}

function limpiarFiltros() {
    console.log('Limpiando filtros...');

    const campos = ['filtroNombre', 'filtroEmail', 'filtroDireccion', 'filtroIdUsuario', 'filtroOficina', 'fechaNacimiento'];

    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = "";
        }
    });

    paginaActualPersonas = 0;
    cargarPersonas(0);
}

function inicializarFiltros() {
    const camposFiltro = ['filtroNombre', 'filtroEmail', 'filtroDireccion', 'filtroIdUsuario'];

    camposFiltro.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    aplicarFiltros();
                }
            });
        }
    });

    const filtroOficina = document.getElementById('filtroOficina');
    if (filtroOficina) {
        filtroOficina.addEventListener('change', function() {
            aplicarFiltros();
        });
    }

    const fechaNacimiento = document.getElementById('fechaNacimiento');
    if (fechaNacimiento) {
        fechaNacimiento.addEventListener('change', function() {
            aplicarFiltros();
        });
    }
}

async function cargarOficinasFiltro() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/oficinas');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const oficinas = await respuesta.json();
        const select = document.getElementById("filtroOficina");

        if (select) {
            select.innerHTML = '<option value="">Todas las oficinas</option>';
            oficinas.forEach(oficina => {
                const option = document.createElement('option');
                option.value = oficina.idOficina;
                option.textContent = oficina.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
    }
}

async function exportarPDF() {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para exportar a PDF.', 'error');
        return;
    }

    const filtros = obtenerFiltros();
    delete filtros.page;
    delete filtros.size;
    delete filtros.sortBy;
    delete filtros.sortDirection;

    try {
        mostrarNotificacion('Generando reporte PDF...', 'info');

        const respuesta = await authorizedFetch('http://localhost:8080/api/reportes/personas/pdf', {
            method: 'POST',
            body: JSON.stringify(filtros)
        });

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personas-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('Reporte PDF generado exitosamente', 'success');

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        mostrarNotificacion('Error al generar el reporte PDF', 'error');
    }
}

async function exportarExcel() {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para exportar a Excel.', 'error');
        return;
    }

    const filtros = obtenerFiltros();
    delete filtros.page;
    delete filtros.size;
    delete filtros.sortBy;
    delete filtros.sortDirection;

    try {
        mostrarNotificacion('Generando reporte Excel...', 'info');

        const respuesta = await authorizedFetch('http://localhost:8080/api/reportes/personas/excel', {
            method: 'POST',
            body: JSON.stringify(filtros)
        });

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personas-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        mostrarNotificacion('Reporte Excel generado exitosamente', 'success');

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        mostrarNotificacion('Error al generar el reporte Excel', 'error');
    }
}

async function eliminarPersona(index) {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para eliminar personas.', 'error');
        return;
    }

    let persona = await consultarPersona(index);

    if (persona && confirm(`¿Está seguro de eliminar a ${persona.nombre}?\n\nEsta acción no se puede deshacer.`)) {
        try {
            const respuesta = await authorizedFetch(`http://localhost:8080/api/personas/${index}`, {
                method: 'DELETE'
            });

            if (!respuesta || !respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
            }

            mostrarNotificacion(`Persona "${persona.nombre}" eliminada correctamente`, 'success');
            await cargarPersonas(paginaActualPersonas);

        } catch (error) {
            console.error('Error al eliminar persona:', error);
            mostrarNotificacion('No se pudo eliminar la persona.', 'error');
        }
    }
}

async function consultarPersona(index) {
    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/personas/${index}`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        return await respuesta.json();

    } catch (error) {
        console.error('Error al obtener persona:', error);
        mostrarNotificacion('No se pudieron obtener los datos de la persona.', 'error');
        return null;
    }
}

function editarPersona(index) {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para editar personas.', 'error');
        return;
    }

    localStorage.setItem("editIndex", index);
    window.location.href = "formPersona.html";
}

async function cargarOficinasPorCombobox() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/oficinas');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const oficinas = await respuesta.json();
        let select = document.getElementById("oficina");

        if (select) {
            select.innerHTML = '<option value="">Seleccione una oficina</option>';

            oficinas.forEach(oficina => {
                let option = document.createElement('option');
                option.value = oficina.idOficina;
                option.textContent = oficina.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
        mostrarNotificacion('No se pudieron cargar las oficinas.', 'error');
    }
}

async function cargarPersonaParaEditar() {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para crear o editar personas.', 'error');
        setTimeout(() => {
            window.location.href = "personaIndex.html";
        }, 2000);
        return;
    }

    const id = localStorage.getItem("editIndex");
    if (id) {
        try {
            await cargarOficinasPorCombobox();

            const persona = await consultarPersona(id);
            if (persona) {
                document.getElementById("idUsuario").value = persona.idUsuario;
                document.getElementById("nombre").value = persona.nombre;
                document.getElementById("email").value = persona.email;
                document.getElementById("direccion").value = persona.direccion;
                document.getElementById("fechaNacimiento").value = persona.fechaNacimiento;

                if (persona.oficina && persona.oficina.idOficina) {
                    document.getElementById("oficina").value = persona.oficina.idOficina;
                }
            }
        } catch (error) {
            console.error('Error al cargar persona para editar:', error);
            mostrarNotificacion('No se pudo cargar la información de la persona.', 'error');
        }
    } else {
        await cargarOficinasPorCombobox();
    }
}

async function guardarPersona(event) {
    event.preventDefault();

    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para crear o editar personas.', 'error');
        return;
    }

    let form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let oficinaId = document.getElementById("oficina").value;
    let persona = {
        idUsuario: document.getElementById("idUsuario").value,
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        direccion: document.getElementById("direccion").value,
        fechaNacimiento: document.getElementById("fechaNacimiento").value,
        oficina: {
            idOficina: parseInt(oficinaId)
        }
    };

    let index = localStorage.getItem("editIndex");
    let url = index ? `http://localhost:8080/api/personas/${index}` : 'http://localhost:8080/api/personas';
    let metodo = index ? 'PUT' : 'POST';

    try {
        const respuesta = await authorizedFetch(url, {
            method: metodo,
            body: JSON.stringify(persona)
        });

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const mensaje = index ?
            `Persona "${persona.nombre}" actualizada correctamente` :
            `Persona "${persona.nombre}" creada correctamente`;

        mostrarNotificacion(mensaje, 'success');
        localStorage.removeItem("editIndex");

        setTimeout(() => {
            window.location.href = "personaIndex.html";
        }, 1500);

    } catch (error) {
        console.error('Error al guardar persona:', error);
        mostrarNotificacion('No se pudo guardar la persona.', 'error');
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

window.aplicarFiltros = aplicarFiltros;
window.limpiarFiltros = limpiarFiltros;
window.exportarPDF = exportarPDF;
window.exportarExcel = exportarExcel;
window.eliminarPersona = eliminarPersona;
window.editarPersona = editarPersona;
window.guardarPersona = guardarPersona;
window.cambiarPaginaPersonas = cambiarPaginaPersonas;