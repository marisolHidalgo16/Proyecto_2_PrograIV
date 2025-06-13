let paginaActual = 0;
let totalPaginas = 0;
const tamanoPagina = 5;

function mostrarCargandoReportes() {
    const tbody = document.getElementById("tablaPersonas");
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Generando reporte...</p>
            </td>
        </tr>
    `;
}

async function cargarOficinas() {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/oficinas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const oficinas = await respuesta.json();
        const select = document.getElementById("filtroOficina");

        select.innerHTML = '<option value="">Todas las oficinas</option>';

        oficinas.forEach(oficina => {
            const option = document.createElement('option');
            option.value = oficina.idOficina;
            option.textContent = oficina.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
    }
}

async function filtrarPersonas(pagina = 0) {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    mostrarCargandoReportes();

    const filtros = {
        nombre: document.getElementById("filtroNombre").value.trim(),
        email: document.getElementById("filtroEmail").value.trim(),
        direccion: document.getElementById("filtroDireccion").value.trim(),
        oficinaId: document.getElementById("filtroOficina").value || null,
        fechaDesde: document.getElementById("fechaDesde").value || null,
        fechaHasta: document.getElementById("fechaHasta").value || null,
        page: pagina,
        size: tamanoPagina,
        sortBy: document.getElementById("ordenarPor").value,
        sortDirection: document.getElementById("direccionOrden").value
    };

    try {
        const respuesta = await fetch('http://localhost:8080/api/reportes/personas/filtrar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtros)
        });

        if (!respuesta.ok) {
            if (respuesta.status === 401 || respuesta.status === 403) {
                alert("Sesión expirada. Por favor inicia sesión.");
                localStorage.removeItem("jwt");
                window.location.href = "login.html";
                return;
            }
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const resultado = await respuesta.json();
        mostrarResultados(resultado);
        paginaActual = resultado.currentPage;
        totalPaginas = resultado.totalPages;
        crearPaginacion();

    } catch (error) {
        console.error('Error al filtrar personas:', error);

        const tbody = document.getElementById("tablaPersonas");
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al generar el reporte</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                </td>
            </tr>
        `;

        alert('Error al filtrar personas. Verifique su conexión.');
    }
}

function mostrarResultados(resultado) {
    const tbody = document.getElementById("tablaPersonas");
    const totalResultados = document.getElementById("totalResultados");

    totalResultados.textContent = `${resultado.totalItems} resultado${resultado.totalItems !== 1 ? 's' : ''}`;

    tbody.innerHTML = "";

    if (resultado.personas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">No se encontraron personas con los filtros aplicados</p>
                    <small class="text-muted">Intenta ajustar los criterios de búsqueda</small>
                </td>
            </tr>
        `;
        return;
    }

    resultado.personas.forEach(persona => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
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
                    <i class="bi bi-building me-1"></i>${persona.oficina ? persona.oficina.nombre : 'Sin oficina'}
                </span>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

function crearPaginacion() {
    const paginacion = document.getElementById("paginacion");
    paginacion.innerHTML = "";

    if (totalPaginas <= 1) return;

    const anteriorLi = document.createElement('li');
    anteriorLi.className = `page-item ${paginaActual === 0 ? 'disabled' : ''}`;
    anteriorLi.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
            <i class="bi bi-chevron-left"></i> Anterior
        </a>
    `;
    paginacion.appendChild(anteriorLi);

    const inicio = Math.max(0, paginaActual - 2);
    const fin = Math.min(totalPaginas - 1, paginaActual + 2);

    for (let i = inicio; i <= fin; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i + 1}</a>
        `;
        paginacion.appendChild(li);
    }

    const siguienteLi = document.createElement('li');
    siguienteLi.className = `page-item ${paginaActual === totalPaginas - 1 ? 'disabled' : ''}`;
    siguienteLi.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
            Siguiente <i class="bi bi-chevron-right"></i>
        </a>
    `;
    paginacion.appendChild(siguienteLi);
}

function cambiarPagina(pagina) {
    if (pagina >= 0 && pagina < totalPaginas) {
        filtrarPersonas(pagina);
    }
}

function limpiarFiltros() {
    console.log('Limpiando filtros de reportes...'); // Debug

    document.getElementById("filtroNombre").value = "";
    document.getElementById("filtroEmail").value = "";
    document.getElementById("filtroDireccion").value = "";
    document.getElementById("filtroOficina").value = "";
    document.getElementById("fechaDesde").value = "";
    document.getElementById("fechaHasta").value = "";
    document.getElementById("ordenarPor").value = "nombre";
    document.getElementById("direccionOrden").value = "asc";

    const tbody = document.getElementById("tablaPersonas");
    const totalResultados = document.getElementById("totalResultados");

    totalResultados.textContent = "0 resultados";
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center text-muted py-4">
                <i class="bi bi-funnel text-muted" style="font-size: 2rem;"></i>
                <p class="mt-2 mb-0">Filtros limpiados - Haz clic en "Filtrar Datos" para ver los resultados</p>
                <small class="text-muted">Configura los filtros y genera tu reporte personalizado</small>
            </td>
        </tr>
    `;

    document.getElementById("paginacion").innerHTML = "";
}

async function exportarPDF() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    const filtros = {
        nombre: document.getElementById("filtroNombre").value.trim(),
        email: document.getElementById("filtroEmail").value.trim(),
        direccion: document.getElementById("filtroDireccion").value.trim(),
        oficinaId: document.getElementById("filtroOficina").value || null,
        fechaDesde: document.getElementById("fechaDesde").value || null,
        fechaHasta: document.getElementById("fechaHasta").value || null
    };

    try {

        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando PDF...';
        event.target.disabled = true;

        const respuesta = await fetch('http://localhost:8080/api/reportes/personas/pdf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtros)
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-personas-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('📄 Reporte PDF generado exitosamente');

        event.target.innerHTML = originalText;
        event.target.disabled = false;

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        alert('❌ Error al generar el reporte PDF');

        event.target.innerHTML = '<i class="bi bi-file-pdf"></i> Generar PDF';
        event.target.disabled = false;
    }
}

async function exportarExcel() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    const filtros = {
        nombre: document.getElementById("filtroNombre").value.trim(),
        email: document.getElementById("filtroEmail").value.trim(),
        direccion: document.getElementById("filtroDireccion").value.trim(),
        oficinaId: document.getElementById("filtroOficina").value || null,
        fechaDesde: document.getElementById("fechaDesde").value || null,
        fechaHasta: document.getElementById("fechaHasta").value || null
    };

    try {

        const originalText = event.target.innerHTML;
        event.target.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando Excel...';
        event.target.disabled = true;

        const respuesta = await fetch('http://localhost:8080/api/reportes/personas/excel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtros)
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-personas-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        alert('📊 Reporte Excel generado exitosamente');

        event.target.innerHTML = originalText;
        event.target.disabled = false;

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        alert('❌ Error al generar el reporte Excel');

        event.target.innerHTML = '<i class="bi bi-file-excel"></i> Generar Excel';
        event.target.disabled = false;
    }
}