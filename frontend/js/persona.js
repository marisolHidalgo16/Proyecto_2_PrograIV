let paginaActualPersonas = 0;
let totalPaginasPersonas = 0;
const tamanoPaginaPersonas = 5;

function mostrarCargando() {
    const tbody = document.getElementById("personas-list");
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

async function cargarPersonas(pagina = 0) {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

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

    console.log('Parámetros enviados:', params.toString()); // Debug

    try {
        const respuesta = await fetch(`http://localhost:8080/api/personas?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        console.log('Resultado obtenido:', resultado); // Debug
        mostrarPersonas(resultado);
        actualizarPaginacion(resultado);

    } catch (error) {
        console.error('Error al cargar personas:', error);

        const tbody = document.getElementById("personas-list");
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al cargar las personas</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                </td>
            </tr>
        `;

        alert('No se pudieron obtener las personas. Verifique su conexión.');
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
        sortBy: 'nombre', // Valor fijo
        sortDirection: 'asc' // Valor fijo
    };

    console.log('Filtros obtenidos:', filtros); // Debug
    return filtros;
}

function mostrarPersonas(resultado) {
    const tbody = document.getElementById("personas-list");
    const totalElement = document.getElementById("total-personas");

    if (totalElement) {
        totalElement.textContent = `${resultado.totalItems} persona${resultado.totalItems !== 1 ? 's' : ''}`;
    }

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
                <div class="btn-group" role="group">
                    <button onclick="editarPersona(${persona.idAuto})" class="btn btn-warning btn-sm" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="eliminarPersona(${persona.idAuto})" class="btn btn-danger btn-sm" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
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
            <a class="page-link" href="#" onclick="cambiarPaginaPersonas(${paginaActualPersonas - 1}); return false;">Anterior</a>
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
            <a class="page-link" href="#" onclick="cambiarPaginaPersonas(${paginaActualPersonas + 1}); return false;">Siguiente</a>
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
    console.log('Aplicando filtros...'); // Debug
    paginaActualPersonas = 0;
    cargarPersonas(0);
}

function limpiarFiltros() {
    console.log('Limpiando filtros...'); // Debug

    const filtroNombre = document.getElementById("filtroNombre");
    const filtroEmail = document.getElementById("filtroEmail");
    const filtroDireccion = document.getElementById("filtroDireccion");
    const filtroIdUsuario = document.getElementById("filtroIdUsuario");
    const filtroOficina = document.getElementById("filtroOficina");
    const fechaNacimiento = document.getElementById("fechaNacimiento");

    if (filtroNombre) filtroNombre.value = "";
    if (filtroEmail) filtroEmail.value = "";
    if (filtroDireccion) filtroDireccion.value = "";
    if (filtroIdUsuario) filtroIdUsuario.value = "";
    if (filtroOficina) filtroOficina.value = "";
    if (fechaNacimiento) fechaNacimiento.value = "";

    paginaActualPersonas = 0;
    cargarPersonas(0);
}

async function cargarOficinasFiltro() {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/oficinas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

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
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    const filtros = obtenerFiltros();

    delete filtros.page;
    delete filtros.size;
    delete filtros.sortBy;
    delete filtros.sortDirection;

    try {
        const respuesta = await fetch('http://localhost:8080/api/reportes/personas/pdf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtros)
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personas-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('Reporte PDF generado exitosamente');

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('Error al generar el reporte PDF');
    }
}

async function exportarExcel() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    const filtros = obtenerFiltros();

    delete filtros.page;
    delete filtros.size;
    delete filtros.sortBy;
    delete filtros.sortDirection;

    try {
        const respuesta = await fetch('http://localhost:8080/api/reportes/personas/excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtros)
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personas-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('Reporte Excel generado exitosamente');

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        alert('Error al generar el reporte Excel');
    }
}

async function eliminarPersona(index) {
    let persona = await consultarPersona(index);

    if (persona && confirm(`¿Está seguro de eliminar a ${persona.nombre}?`)) {
        const token = localStorage.getItem("jwt");

        try {
            const respuesta = await fetch(`http://localhost:8080/api/personas/${index}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!respuesta.ok) {
                if (respuesta.status === 401 || respuesta.status === 403) {
                    alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                    localStorage.removeItem("jwt");
                    window.location.href = "login.html";
                    return;
                }
                throw new Error(`Error ${respuesta.status}`);
            }

            alert("Persona eliminada correctamente");
            cargarPersonas(paginaActualPersonas);
        } catch (error) {
            console.error('Error al eliminar persona:', error);
            alert('No se pudo eliminar la persona. ¡Algo salió mal!');
        }
    }
}

async function consultarPersona(index) {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://localhost:8080/api/personas/${index}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
                return null;
            }
            throw new Error(`Error ${respuesta.status}`);
        }

        return await respuesta.json();
    } catch (error) {
        console.error('Error al obtener persona:', error);
        alert('No pudimos obtener los datos de esta persona.');
        return null;
    }
}

function editarPersona(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "formPersona.html";
}

async function cargarOficinasPorCombobox() {
    try {
        const token = localStorage.getItem("jwt");
        const respuesta = await fetch('http://localhost:8080/api/oficinas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const oficinas = await respuesta.json();
        let select = document.getElementById("oficina");
        select.innerHTML = '<option value="">Seleccione una oficina</option>';

        oficinas.forEach(oficina => {
            let option = document.createElement('option');
            option.value = oficina.idOficina;
            option.textContent = oficina.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
        alert('No se pudieron obtener las oficinas para el formulario.');
    }
}

async function cargarPersonaParaEditar() {
    const id = localStorage.getItem("editIndex");
    if (id) {
        try {
            await cargarOficinasPorCombobox();

            const token = localStorage.getItem("jwt");
            const respuesta = await fetch(`http://localhost:8080/api/personas/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!respuesta.ok) {
                if (respuesta.status === 401 || respuesta.status === 403) {
                    alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                    localStorage.removeItem("jwt");
                    window.location.href = "login.html";
                    return;
                }
                throw new Error(`HTTP ${respuesta.status}`);
            }

            const persona = await respuesta.json();
            document.getElementById("idUsuario").value = persona.idUsuario;
            document.getElementById("nombre").value = persona.nombre;
            document.getElementById("email").value = persona.email;
            document.getElementById("direccion").value = persona.direccion;
            document.getElementById("fechaNacimiento").value = persona.fechaNacimiento;

            if (persona.oficina && persona.oficina.idOficina) {
                document.getElementById("oficina").value = persona.oficina.idOficina;
            }
        } catch (error) {
            console.error('Error al cargar persona para editar:', error);
            alert('No se pudo cargar la información de la persona.');
        }
    } else {
        await cargarOficinasPorCombobox();
    }
}

async function guardarPersona(event) {
    event.preventDefault();

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

    const token = localStorage.getItem("jwt");
    let index = localStorage.getItem("editIndex");

    let url = index ? `http://localhost:8080/api/personas/${index}` : 'http://localhost:8080/api/personas';
    let metodo = index ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(persona)
        });

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                alert("Sesión expirada. Por favor inicia sesión nuevamente.");
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`Error ${respuesta.status}`);
        }

        alert(index ? "Persona actualizada correctamente" : "Persona creada correctamente");
        localStorage.removeItem("editIndex");
        window.location.href = "personaIndex.html";
    } catch (error) {
        console.error('Error al guardar persona:', error);
        alert('No se pudo guardar la persona. Verifique su conexión.');
    }
}

function inicializarFiltros() {

    const camposFiltro = [
        'filtroNombre', 'filtroEmail', 'filtroDireccion', 'filtroIdUsuario'
    ];

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

document.addEventListener('DOMContentLoaded', function() {
    inicializarFiltros();
});