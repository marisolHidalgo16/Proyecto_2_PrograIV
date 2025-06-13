let chartPersonasIngresos = null;
let chartOficinasOcupacion = null;
let permisosUsuario = null;
let autoUpdateInterval = null;

document.addEventListener("DOMContentLoaded", async function() {

    const isAuth = await verificarAutenticacion();
    if (!isAuth) return;

    await cargarPermisosUsuario();

    aplicarPermisosVisuales();

    await cargarEstadisticas();

    configurarAutoActualizacion();

    console.log('Módulo de reportes y estadísticas inicializado correctamente');
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
        alert("No tienes permisos para acceder a reportes y estadísticas.");
        window.location.href = "registrosIndex.html";
        return;
    }

    if (role === "ROLE_VISOR" || role === "ROLE_ADMINISTRADOR") {

        console.log(`Usuario ${role}: Acceso a reportes habilitado`);

        mostrarMensajeInfoPermisos("Panel de reportes y estadísticas - Información actualizada en tiempo real");
    }
}

function mostrarMensajeInfoPermisos(mensaje) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show mb-3';
    alertDiv.innerHTML = `
        <i class="bi bi-graph-up me-2"></i>
        <strong>Dashboard:</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container-fluid');
    if (container && container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild.nextSibling);
    }
}

async function cargarEstadisticas() {
    try {

        mostrarCargandoEstadisticas();

        await Promise.all([
            cargarResumenGeneral(),
            cargarDashboard()
        ]);

        console.log('Reportes y estadísticas cargados exitosamente');

    } catch (error) {
        console.error('Error al cargar reportes y estadísticas:', error);
        mostrarNotificacion('Error al cargar los reportes y estadísticas. Verifique su conexión.', 'error');
    }
}

async function cargarResumenGeneral() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/estadisticas/resumen-general');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const resumen = await respuesta.json();

        actualizarTarjetaConAnimacion('totalPersonas', resumen.totalPersonas);
        actualizarTarjetaConAnimacion('totalOficinas', resumen.totalOficinas);
        actualizarTarjetaConAnimacion('registrosHoy', resumen.registrosHoy);
        actualizarTarjetaConAnimacion('personasEnOficinas', resumen.personasEnOficinas);

    } catch (error) {
        console.error('Error al cargar resumen general:', error);

        const elementos = ['totalPersonas', 'totalOficinas', 'registrosHoy', 'personasEnOficinas'];
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = '0';
        });
    }
}

function actualizarTarjetaConAnimacion(elementoId, nuevoValor) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {

        elemento.style.transition = 'opacity 0.3s ease';
        elemento.style.opacity = '0.5';

        setTimeout(() => {
            elemento.textContent = nuevoValor;
            elemento.style.opacity = '1';
        }, 150);
    }
}

async function cargarDashboard() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/estadisticas/dashboard');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const dashboard = await respuesta.json();

        actualizarGraficoPersonasIngresos(dashboard.personasConMasIngresos);
        actualizarGraficoOficinasOcupacion(dashboard.oficinasConMasOcupacion);
        mostrarPersonasActualesEnOficinas(dashboard.personasActualmenteEnOficinas);

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        throw error;
    }
}

function actualizarGraficoPersonasIngresos(datos) {
    const ctx = document.getElementById('chartPersonasIngresos')?.getContext('2d');
    if (!ctx) return;

    if (chartPersonasIngresos) {
        chartPersonasIngresos.destroy();
    }

    if (datos.length === 0) {
        mostrarMensajeSinDatos(ctx, "No hay datos de personas con ingresos");
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
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
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
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            return `Ingresos: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        color: '#666'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function actualizarGraficoOficinasOcupacion(datos) {
    const ctx = document.getElementById('chartOficinasOcupacion')?.getContext('2d');
    if (!ctx) return;

    if (chartOficinasOcupacion) {
        chartOficinasOcupacion.destroy();
    }

    if (datos.length === 0) {
        mostrarMensajeSinDatos(ctx, "No hay datos de ocupación de oficinas");
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
                borderWidth: 3,
                hoverBorderWidth: 4
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
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        color: '#666'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    });
}

function mostrarMensajeSinDatos(ctx, mensaje) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(mensaje, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function mostrarPersonasActualesEnOficinas(datos) {
    const container = document.getElementById('personasActualesContainer');
    const totalElement = document.getElementById('totalPersonasEnOficinas');

    if (!container || !totalElement) return;

    const totalPersonas = datos.reduce((total, oficina) => total + oficina.personasActualmente, 0);
    totalElement.textContent = `${totalPersonas} persona${totalPersonas !== 1 ? 's' : ''}`;

    if (datos.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
                <h5 class="mt-3 text-muted">Sin personas en oficinas</h5>
                <p class="text-muted">No hay personas registradas actualmente en ninguna oficina</p>
                <small class="text-muted">Los datos aparecerán aquí cuando haya registros de entrada</small>
            </div>
        `;
        return;
    }

    let html = '<div class="row">';

    datos.forEach(oficina => {
        const porcentajeOcupacion = oficina.capacidadMaxima
            ? Math.round((oficina.personasActualmente / oficina.capacidadMaxima) * 100)
            : 0;

        const colorBarra = porcentajeOcupacion >= 90 ? 'danger' :
            porcentajeOcupacion >= 70 ? 'warning' : 'success';

        const colorTarjeta = porcentajeOcupacion >= 90 ? 'border-danger' :
            porcentajeOcupacion >= 70 ? 'border-warning' : 'border-success';

        html += `
            <div class="col-lg-6 mb-4">
                <div class="card ${colorTarjeta} shadow-sm h-100">
                    <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0 fw-bold">
                                <i class="bi bi-building text-primary me-2"></i>${oficina.nombreOficina}
                            </h6>
                            <span class="badge bg-primary fs-6">${oficina.personasActualmente}/${oficina.capacidadMaxima || '∞'}</span>
                        </div>
                        ${oficina.capacidadMaxima ? `
                            <div class="mt-2">
                                <div class="progress" style="height: 10px;">
                                    <div class="progress-bar bg-${colorBarra} progress-bar-striped progress-bar-animated" 
                                         style="width: ${Math.min(porcentajeOcupacion, 100)}%"></div>
                                </div>
                                <small class="text-muted mt-1 d-block">
                                    <i class="bi bi-speedometer2 me-1"></i>
                                    ${porcentajeOcupacion}% de ocupación
                                    ${porcentajeOcupacion >= 90 ? ' - ⚠️ Capacidad crítica' :
            porcentajeOcupacion >= 70 ? ' - ⚡ Alta ocupación' : ' - ✅ Normal'}
                                </small>
                            </div>
                        ` : `
                            <small class="text-muted mt-2 d-block">
                                <i class="bi bi-infinity me-1"></i>Capacidad ilimitada
                            </small>
                        `}
                    </div>
                    <div class="card-body">
                        <div class="row g-2">
        `;

        if (oficina.personas.length === 0) {
            html += `
                <div class="col-12 text-center py-3">
                    <i class="bi bi-person-x text-muted" style="font-size: 2rem;"></i>
                    <p class="text-muted mb-0 mt-2">Sin personas actualmente</p>
                </div>
            `;
        } else {
            oficina.personas.forEach(persona => {
                const horaEntrada = persona.horaEntrada ?
                    new Date(persona.horaEntrada).toLocaleString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                    }) : 'N/A';

                const tiempoTranscurrido = persona.horaEntrada ?
                    calcularTiempoTranscurrido(persona.horaEntrada) : '';

                html += `
                    <div class="col-md-6 mb-2">
                        <div class="border rounded p-2 bg-light">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-person-circle text-success me-2" style="font-size: 1.2rem;"></i>
                                <div class="flex-grow-1">
                                    <div class="fw-bold text-dark" style="font-size: 0.9rem;">${persona.nombre}</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">
                                        <i class="bi bi-card-text me-1"></i>${persona.idUsuario}
                                    </div>
                                    <div class="text-muted" style="font-size: 0.75rem;">
                                        <i class="bi bi-clock me-1"></i>${horaEntrada}
                                        ${tiempoTranscurrido ? `<br><i class="bi bi-hourglass-split me-1"></i>${tiempoTranscurrido}` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    container.style.opacity = '0.5';
    container.innerHTML = html;

    setTimeout(() => {
        container.style.transition = 'opacity 0.3s ease';
        container.style.opacity = '1';
    }, 100);
}

function calcularTiempoTranscurrido(fechaEntrada) {
    try {
        const entrada = new Date(fechaEntrada);
        const ahora = new Date();
        const diferencia = ahora - entrada;

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        } else {
            return `${minutos}m`;
        }
    } catch (error) {
        return '';
    }
}

function configurarAutoActualizacion() {
    // Auto-actualizar cada 2 minutos
    autoUpdateInterval = setInterval(async function() {
        console.log('Auto-actualizando reportes y estadísticas...');
        try {
            await cargarResumenGeneral();
            await cargarPersonasActuales();
            mostrarNotificacionTemporal('Datos actualizados automáticamente', 'info', 2000);
        } catch (error) {
            console.error('Error en auto-actualización:', error);
        }
    }, 120000);

    console.log('Auto-actualización configurada cada 2 minutos');
}

async function cargarPersonasActuales() {
    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/estadisticas/personas-actualmente-en-oficinas');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const datos = await respuesta.json();
        mostrarPersonasActualesEnOficinas(datos);

    } catch (error) {
        console.error('Error al cargar personas actuales:', error);
    }
}

function mostrarCargandoEstadisticas() {

    const graficos = ['chartPersonasIngresos', 'chartOficinasOcupacion'];

    graficos.forEach(chartId => {
        const canvas = document.getElementById(chartId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "16px Arial";
            ctx.fillStyle = "#007bff";
            ctx.textAlign = "center";
            ctx.fillText("Cargando datos...", canvas.width / 2, canvas.height / 2);
        }
    });

    const container = document.getElementById('personasActualesContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <h5 class="mt-3 text-muted">Cargando estadísticas...</h5>
                <p class="text-muted">Obteniendo información actualizada del sistema</p>
            </div>
        `;
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    mostrarNotificacionTemporal(mensaje, tipo, 5000);
}

function mostrarNotificacionTemporal(mensaje, tipo = 'info', duracion = 3000) {

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
    }, duracion);
}

window.addEventListener('beforeunload', function() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }

    if (chartPersonasIngresos) {
        chartPersonasIngresos.destroy();
    }

    if (chartOficinasOcupacion) {
        chartOficinasOcupacion.destroy();
    }
});

window.cargarEstadisticas = cargarEstadisticas;