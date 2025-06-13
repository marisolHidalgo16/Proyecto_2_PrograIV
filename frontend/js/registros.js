let paginaActualRegistros = 0;
let totalPaginasRegistros = 0;
const tamanoPaginaRegistros = 5;

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
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    mostrarCargandoRegistros();

    const params = new URLSearchParams();
    params.append('page', pagina);
    params.append('size', tamanoPaginaRegistros);
    params.append('sortBy', 'fechaHora');
    params.append('sortDirection', 'desc');

    console.log('Cargando registros, página:', pagina);

    try {
        const respuesta = await fetch(`http://localhost:8080/api/registros?${params.toString()}`, {
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
        console.log('Resultado registros obtenido:', resultado);
        mostrarRegistros(resultado);
        actualizarPaginacionRegistros(resultado);

    } catch (error) {
        console.error('Error al cargar registros:', error);

        const tbody = document.getElementById("registros-list");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-4">
                        <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                        <p class="mt-2 mb-0">Error al cargar los registros</p>
                        <small class="text-muted">Verifique su conexión a internet</small>
                    </td>
                </tr>
            `;
        }

        alert('No se pudieron obtener los registros. Verifique su conexión.');
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
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/personas/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

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
        alert('Error al cargar la lista de personas');
    }
}

async function cargarOficinasCombo() {
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
        alert('Error al cargar la lista de oficinas');
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

    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://localhost:8080/api/registros/persona/${personaId}/estado`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

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

    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://localhost:8080/api/registros/oficina/${oficinaId}/personas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

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

    const token = localStorage.getItem("jwt");

    try {
        const endpoint = tipoMovimiento === 'ENTRADA' ? 'entrada' : 'salida';

        const respuesta = await fetch(`http://localhost:8080/api/registros/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personaId: personaId,
                oficinaId: oficinaId,
                fechaHora: fechaHora,
                observaciones: null
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.message || 'Error al procesar el registro');
        }

        alert(`✅ ${resultado.message}`);

        limpiarFormulario();
        window.location.href = "registrosIndex.html";

    } catch (error) {
        console.error('Error al procesar registro:', error);
        alert(`❌ ${error.message}`);
    }
}

function limpiarFormulario() {
    const persona = document.getElementById("persona");
    const oficina = document.getElementById("oficina");
    const tipoMovimiento = document.getElementById("tipoMovimiento");
    const fechaHora = document.getElementById("fechaHora");
    const infoEstado = document.getElementById("info-estado");
    const infoCapacidad = document.getElementById("info-capacidad");

    if (persona) persona.value = "";
    if (oficina) oficina.value = "";
    if (tipoMovimiento) tipoMovimiento.value = "";
    if (fechaHora) {
        // Establecer fecha y hora actual
        const ahora = new Date();
        fechaHora.value = ahora.toISOString().slice(0, 16);
    }

    if (infoEstado) infoEstado.style.display = "none";
    if (infoCapacidad) infoCapacidad.style.display = "none";

    document.querySelectorAll('.was-validated').forEach(el => {
        el.classList.remove('was-validated');
    });
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