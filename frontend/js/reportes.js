// =================== VARIABLES GLOBALES ===================
// Variables para gráficos de estadísticas
let chartPersonasIngresos = null;
let chartOficinasOcupacion = null;

// =================== FUNCIONES PRINCIPALES ===================

// Función principal para cargar todas las estadísticas
async function cargarEstadisticas() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    try {
        // Mostrar indicadores de carga
        mostrarCargandoEstadisticas();

        // Cargar todas las estadísticas sin filtros
        await Promise.all([
            cargarResumenGeneral(),
            cargarDashboard()
        ]);

        console.log('Reportes y estadísticas cargados exitosamente');

    } catch (error) {
        console.error('Error al cargar reportes y estadísticas:', error);
        alert('Error al cargar los reportes y estadísticas. Verifique su conexión.');
    }
}

// Función para cargar el resumen general (tarjetas superiores)
async function cargarResumenGeneral() {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/estadisticas/resumen-general', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const resumen = await respuesta.json();

        // Actualizar las tarjetas
        document.getElementById('totalPersonas').textContent = resumen.totalPersonas;
        document.getElementById('totalOficinas').textContent = resumen.totalOficinas;
        document.getElementById('registrosHoy').textContent = resumen.registrosHoy;
        document.getElementById('personasEnOficinas').textContent = resumen.personasEnOficinas;

    } catch (error) {
        console.error('Error al cargar resumen general:', error);
        // Mantener valores en 0 si hay error
        document.getElementById('totalPersonas').textContent = '0';
        document.getElementById('totalOficinas').textContent = '0';
        document.getElementById('registrosHoy').textContent = '0';
        document.getElementById('personasEnOficinas').textContent = '0';
    }
}

// Función para cargar el dashboard completo (sin filtros)
async function cargarDashboard() {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/estadisticas/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const dashboard = await respuesta.json();

        // Actualizar gráficos y tablas
        actualizarGraficoPersonasIngresos(dashboard.personasConMasIngresos);
        actualizarGraficoOficinasOcupacion(dashboard.oficinasConMasOcupacion);
        mostrarPersonasActualesEnOficinas(dashboard.personasActualmenteEnOficinas);

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        throw error;
    }
}

// =================== FUNCIONES DE GRÁFICOS ===================

// Función para actualizar el gráfico de personas con más ingresos
function actualizarGraficoPersonasIngresos(datos) {
    const ctx = document.getElementById('chartPersonasIngresos')?.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (chartPersonasIngresos) {
        chartPersonasIngresos.destroy();
    }

    if (datos.length === 0) {
        // Mostrar mensaje si no hay datos
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText("No hay datos disponibles", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const labels = datos.map(item => item.nombre);
    const valores = datos.map(item => item.cantidadIngresos);

    chartPersonasIngresos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Ingresos',
                data: valores,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)',
                    'rgba(255, 99, 255, 0.8)',
                    'rgba(99, 255, 132, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(159, 159, 159, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 99, 255, 1)',
                    'rgba(99, 255, 132, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Personas con Más Ingresos',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Función para actualizar el gráfico de oficinas con más ocupación
function actualizarGraficoOficinasOcupacion(datos) {
    const ctx = document.getElementById('chartOficinasOcupacion')?.getContext('2d');
    if (!ctx) return;

    // Destruir gráfico anterior si existe
    if (chartOficinasOcupacion) {
        chartOficinasOcupacion.destroy();
    }

    if (datos.length === 0) {
        // Mostrar mensaje si no hay datos
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText("No hay datos disponibles", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const labels = datos.map(item => item.nombre);
    const valores = datos.map(item => item.totalIngresos);

    chartOficinasOcupacion = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total de Ingresos',
                data: valores,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(199, 199, 199, 0.8)',
                    'rgba(83, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(159, 159, 159, 1)',
                    'rgba(83, 102, 255, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Ingresos por Oficina',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Función para mostrar las personas actualmente en oficinas
function mostrarPersonasActualesEnOficinas(datos) {
    const container = document.getElementById('personasActualesContainer');
    const totalElement = document.getElementById('totalPersonasEnOficinas');

    if (!container || !totalElement) return;

    // Calcular total de personas
    const totalPersonas = datos.reduce((total, oficina) => total + oficina.personasActualmente, 0);
    totalElement.textContent = `${totalPersonas} persona${totalPersonas !== 1 ? 's' : ''}`;

    if (datos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <p class="mt-2 mb-0 text-muted">No hay personas en oficinas actualmente</p>
                <small class="text-muted">Los registros aparecerán aquí cuando haya personas en las oficinas</small>
            </div>
        `;
        return;
    }

    let html = '<div class="row">';

    datos.forEach(oficina => {
        const porcentajeOcupacion = oficina.capacidadMaxima
            ? Math.round((oficina.personasActualmente / oficina.capacidadMaxima) * 100)
            : 0;

        const colorBarra = porcentajeOcupacion >= 80 ? 'danger' :
            porcentajeOcupacion >= 60 ? 'warning' : 'success';

        html += `
            <div class="col-lg-6 mb-3">
                <div class="card">
                    <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">
                                <i class="bi bi-building text-primary"></i> ${oficina.nombreOficina}
                            </h6>
                            <span class="badge bg-primary">${oficina.personasActualmente}/${oficina.capacidadMaxima || '∞'}</span>
                        </div>
                        ${oficina.capacidadMaxima ? `
                            <div class="progress mt-2" style="height: 8px;">
                                <div class="progress-bar bg-${colorBarra}" style="width: ${porcentajeOcupacion}%"></div>
                            </div>
                            <small class="text-muted">${porcentajeOcupacion}% de ocupación</small>
                        ` : ''}
                    </div>
                    <div class="card-body">
                        <div class="row">
        `;

        oficina.personas.forEach(persona => {
            const horaEntrada = persona.horaEntrada ?
                new Date(persona.horaEntrada).toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                }) : 'N/A';

            html += `
                <div class="col-md-6 mb-2">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person-circle text-success me-2"></i>
                        <div class="flex-grow-1">
                            <small class="fw-bold">${persona.nombre}</small><br>
                            <small class="text-muted">${persona.idUsuario} • ${horaEntrada}</small>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// =================== FUNCIONES UTILITARIAS ===================

// Función para mostrar indicadores de carga
function mostrarCargandoEstadisticas() {
    // Limpiar gráficos
    const ctxPersonas = document.getElementById('chartPersonasIngresos');
    const ctxOficinas = document.getElementById('chartOficinasOcupacion');

    if (ctxPersonas) {
        const ctx = ctxPersonas.getContext('2d');
        ctx.clearRect(0, 0, ctxPersonas.width, ctxPersonas.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#007bff";
        ctx.textAlign = "center";
        ctx.fillText("Cargando...", ctxPersonas.width / 2, ctxPersonas.height / 2);
    }

    if (ctxOficinas) {
        const ctx = ctxOficinas.getContext('2d');
        ctx.clearRect(0, 0, ctxOficinas.width, ctxOficinas.height);
        ctx.font = "16px Arial";
        ctx.fillStyle = "#007bff";
        ctx.textAlign = "center";
        ctx.fillText("Cargando...", ctxOficinas.width / 2, ctxOficinas.height / 2);
    }

    // Mostrar carga en personas actuales
    const container = document.getElementById('personasActualesContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 mb-0">Actualizando reportes y estadísticas...</p>
            </div>
        `;
    }
}

// Función auxiliar para cargar solo personas actuales (para auto-actualización)
async function cargarPersonasActuales() {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch('http://localhost:8080/api/estadisticas/personas-actualmente-en-oficinas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        mostrarPersonasActualesEnOficinas(datos);

    } catch (error) {
        console.error('Error al cargar personas actuales:', error);
    }
}

// =================== AUTO-ACTUALIZACIÓN ===================

// Event listeners para auto-actualización
document.addEventListener('DOMContentLoaded', function() {
    // Auto-actualizar cada 5 minutos
    setInterval(function() {
        console.log('Auto-actualizando reportes y estadísticas...');
        cargarResumenGeneral();
        cargarPersonasActuales();
    }, 300000); // 5 minutos

    console.log('Módulo de Reportes y Estadísticas iniciado correctamente');
});