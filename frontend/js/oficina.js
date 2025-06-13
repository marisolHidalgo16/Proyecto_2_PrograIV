let oficinasData = [];
let permisosUsuario = null;

document.addEventListener("DOMContentLoaded", async function() {

    const isAuth = await verificarAutenticacion();
    if (!isAuth) return;

    await cargarPermisosUsuario();

    aplicarPermisosVisuales();

    await cargarOficinas();

    localStorage.removeItem("editIndex");

    console.log('Módulo de oficinas inicializado correctamente');
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

        alert("No tienes permisos para acceder al módulo de oficinas.");
        window.location.href = "registrosIndex.html";
        return;
    }

    if (role === "ROLE_VISOR") {

        ocultarElementos([
            'a[href="formOficina.html"]',
            '.btn-warning',
            '.btn-danger'
        ]);

        mostrarMensajeInfoPermisos("Modo de solo lectura - No puedes crear, editar o eliminar oficinas");
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

function mostrarCargandoOficinas() {
    const tbody = document.getElementById("oficinas-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 mb-0">Cargando oficinas...</p>
                </td>
            </tr>
        `;
    }
}

async function cargarOficinas() {
    mostrarCargandoOficinas();

    try {
        const respuesta = await authorizedFetch('http://localhost:8080/api/oficinas');

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const oficinas = await respuesta.json();
        oficinasData = oficinas;
        mostrarOficinas(oficinas);

    } catch (error) {
        console.error('Error al cargar oficinas:', error);
        mostrarErrorEnTabla();
        mostrarNotificacion('Error al cargar oficinas. Verifique su conexión.', 'error');
    }
}

function mostrarErrorEnTabla() {
    const tbody = document.getElementById("oficinas-list");
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al cargar las oficinas</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                    <br>
                    <button class="btn btn-outline-primary btn-sm mt-2" onclick="cargarOficinas()">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function mostrarOficinas(oficinas) {
    const tbody = document.getElementById("oficinas-list");
    const totalElement = document.getElementById("total-oficinas");
    const role = localStorage.getItem("role");

    if (totalElement) {
        totalElement.textContent = `${oficinas.length} oficina${oficinas.length !== 1 ? 's' : ''}`;
    }

    if (!tbody) return;

    tbody.innerHTML = "";

    if (oficinas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-building text-muted" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">No hay oficinas registradas aún</p>
                    <small class="text-muted">¡Agrega la primera oficina para comenzar!</small>
                </td>
            </tr>
        `;
        return;
    }

    oficinas.forEach((oficina) => {
        let coordenadas = '';
        let coordenadasBadge = '';

        if (oficina.latitud && oficina.longitud) {
            coordenadas = `${oficina.latitud.toFixed(4)}, ${oficina.longitud.toFixed(4)}`;
            coordenadasBadge = `<span class="badge bg-info text-dark">
                <i class="bi bi-geo-alt me-1"></i>${coordenadas}
            </span>`;
        } else {
            coordenadasBadge = `<span class="badge bg-secondary">
                <i class="bi bi-question-circle me-1"></i>No disponible
            </span>`;
        }

        let capacidad = oficina.capacidadMaxima ?
            `<span class="badge bg-success">
                <i class="bi bi-people me-1"></i>${oficina.capacidadMaxima} personas
            </span>` :
            `<span class="badge bg-warning text-dark">
                <i class="bi bi-question-circle me-1"></i>No definida
            </span>`;

        let botonesAccion = '<div class="btn-group" role="group">';

        if (oficina.latitud && oficina.longitud) {
            botonesAccion += `
                <button onclick="verEnMapa(${oficina.latitud}, ${oficina.longitud}, '${oficina.nombre.replace(/'/g, "\\'")}')" 
                        class="btn btn-info btn-sm" title="Ver en Mapa">
                    <i class="bi bi-map"></i>
                </button>
            `;
        }

        if (role === "ROLE_ADMINISTRADOR") {
            botonesAccion += `
                <button onclick="editarOficina(${oficina.idOficina})" class="btn btn-warning btn-sm" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button onclick="eliminarOficina(${oficina.idOficina})" class="btn btn-danger btn-sm" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            `;
        }

        botonesAccion += '</div>';

        let fila = `<tr>
            <td><strong>${oficina.idOficina}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-building-fill text-primary me-2"></i>
                    <strong>${oficina.nombre}</strong>
                </div>
            </td>
            <td>
                <small class="text-muted">
                    <i class="bi bi-geo-alt me-1"></i>${oficina.ubicacion}
                </small>
            </td>
            <td>${coordenadasBadge}</td>
            <td>${capacidad}</td>
            <td class="text-center">
                ${botonesAccion}
            </td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

function verEnMapa(lat, lng, nombre) {
    const modalHtml = `
        <div class="modal fade" id="mapaModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-geo-alt-fill"></i> ${nombre}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="modalMap" style="height: 400px; width: 100%; background-color: #e0e0e0; border-radius: 8px;"></div>
                        <div class="mt-3 p-3 bg-light rounded">
                            <h6><i class="bi bi-info-circle text-primary"></i> Información de Ubicación</h6>
                            <p class="mb-1">
                                <strong>Coordenadas:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
                            </p>
                            <p class="mb-0">
                                <strong>Oficina:</strong> ${nombre}
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn btn-primary">
                            <i class="bi bi-box-arrow-up-right"></i> Abrir en Google Maps
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('mapaModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById('mapaModal');
    const modal = new bootstrap.Modal(modalElement);

    modalElement.addEventListener('shown.bs.modal', function () {
        setTimeout(() => {
            try {
                if (typeof google === 'undefined' || !google.maps) {
                    console.error('Google Maps no está disponible');
                    document.getElementById('modalMap').innerHTML =
                        '<div class="alert alert-warning">Google Maps no está disponible. <br>Verifica tu conexión a internet y la API Key.</div>';
                    return;
                }

                const mapContainer = document.getElementById('modalMap');
                const map = new google.maps.Map(mapContainer, {
                    zoom: 16,
                    center: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(lat), lng: parseFloat(lng) },
                    map: map,
                    title: nombre,
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="p-2">
                            <h6 class="text-primary mb-1"><i class="bi bi-building"></i> ${nombre}</h6>
                            <p class="mb-1"><strong>Coordenadas:</strong></p>
                            <small>
                                <i class="bi bi-geo-alt text-danger"></i> 
                                Lat: ${lat.toFixed(6)}<br>
                                <i class="bi bi-geo-alt text-danger"></i> 
                                Lng: ${lng.toFixed(6)}
                            </small>
                        </div>
                    `
                });

                marker.addListener('click', function() {
                    infoWindow.open(map, marker);
                });

            } catch (error) {
                console.error('Error inicializando mapa:', error);
                document.getElementById('modalMap').innerHTML =
                    '<div class="alert alert-danger">Error al cargar el mapa: ' + error.message + '</div>';
            }
        }, 300);
    });

    modal.show();
}

async function eliminarOficina(index) {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para eliminar oficinas.', 'error');
        return;
    }

    let oficina = await consultarOficina(index);

    if (oficina && confirm(`¿Está seguro de eliminar la oficina "${oficina.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        try {
            const respuesta = await authorizedFetch(`http://localhost:8080/api/oficinas/${index}`, {
                method: 'DELETE'
            });

            if (!respuesta || !respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
            }

            mostrarNotificacion(`Oficina "${oficina.nombre}" eliminada correctamente`, 'success');
            await cargarOficinas();

        } catch (error) {
            console.error('Error al eliminar oficina:', error);
            mostrarNotificacion('No se pudo eliminar la oficina.', 'error');
        }
    }
}

async function consultarOficina(index) {
    try {
        const respuesta = await authorizedFetch(`http://localhost:8080/api/oficinas/${index}`);

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        return await respuesta.json();

    } catch (error) {
        console.error('Error al obtener oficina:', error);
        mostrarNotificacion('No se pudieron obtener los datos de la oficina.', 'error');
        return null;
    }
}

function editarOficina(index) {
    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para editar oficinas.', 'error');
        return;
    }

    localStorage.setItem("editIndex", index);
    window.location.href = "formOficina.html";
}

async function guardarOficina(event) {
    event.preventDefault();

    const role = localStorage.getItem("role");

    if (role !== "ROLE_ADMINISTRADOR") {
        mostrarNotificacion('No tienes permisos para crear o editar oficinas.', 'error');
        return;
    }

    let form = event.target;
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    let oficina = {
        nombre: document.getElementById("nombre").value,
        ubicacion: document.getElementById("ubicacion").value,
        latitud: parseFloat(document.getElementById("latitud").value) || null,
        longitud: parseFloat(document.getElementById("longitud").value) || null,
        capacidadMaxima: parseInt(document.getElementById("capacidadMaxima").value) || null
    };

    let index = localStorage.getItem("editIndex");
    let url = index ? `http://localhost:8080/api/oficinas/${index}` : 'http://localhost:8080/api/oficinas';
    let metodo = index ? 'PUT' : 'POST';

    try {
        const respuesta = await authorizedFetch(url, {
            method: metodo,
            body: JSON.stringify(oficina)
        });

        if (!respuesta || !respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta?.status || 'desconocido'}`);
        }

        const mensaje = index ?
            `Oficina "${oficina.nombre}" actualizada correctamente` :
            `Oficina "${oficina.nombre}" creada correctamente`;

        mostrarNotificacion(mensaje, 'success');
        localStorage.removeItem("editIndex");

        setTimeout(() => {
            window.location.href = "oficinaIndex.html";
        }, 1500);

    } catch (error) {
        console.error('Error al guardar oficina:', error);
        mostrarNotificacion('No se pudo guardar la oficina.', 'error');
    }
}

async function obtenerUbicacionActual() {
    console.log('Intentando obtener ubicación...');

    if (navigator.geolocation) {
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            function(position) {
                console.log('¡Ubicación obtenida exitosamente!');

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                document.getElementById("latitud").value = lat.toFixed(6);
                document.getElementById("longitud").value = lng.toFixed(6);

                actualizarMapa(lat, lng);
                obtenerDireccionDesdeCoordenadas(lat, lng);

                mostrarNotificacion('Ubicación obtenida correctamente', 'success');
            },
            function(error) {
                console.error('ERROR de geolocalización:', error);

                let mensaje = 'Error al obtener ubicación: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje += "Permiso denegado por el usuario.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje += "Información de ubicación no disponible.";
                        break;
                    case error.TIMEOUT:
                        mensaje += "Tiempo de espera agotado.";
                        break;
                    default:
                        mensaje += "Error desconocido.";
                        break;
                }

                mostrarNotificacion(mensaje, 'error');
            },
            options
        );
    } else {
        mostrarNotificacion('La geolocalización no es soportada por este navegador.', 'error');
    }
}

let map;
let marker;

function initMap() {
    const defaultLocation = { lat: 9.9281, lng: -84.0907 }; // San José, Costa Rica

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: defaultLocation,
    });

    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
        title: 'Ubicación de la oficina'
    });

    marker.addListener('dragend', function() {
        const position = marker.getPosition();
        document.getElementById("latitud").value = position.lat().toFixed(6);
        document.getElementById("longitud").value = position.lng().toFixed(6);
    });

    map.addListener('click', function(event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        marker.setPosition(event.latLng);
        document.getElementById("latitud").value = lat.toFixed(6);
        document.getElementById("longitud").value = lng.toFixed(6);
    });
}

function actualizarMapa(lat, lng) {
    if (map && marker) {
        const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
        map.setCenter(position);
        marker.setPosition(position);
    }
}

function obtenerDireccionDesdeCoordenadas(lat, lng) {
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps no disponible para geocoding');
        return;
    }

    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                document.getElementById("ubicacion").value = results[0].formatted_address;
            }
        }
    });
}

function onCoordenadasChange() {
    const lat = document.getElementById("latitud").value;
    const lng = document.getElementById("longitud").value;

    if (lat && lng) {
        actualizarMapa(lat, lng);
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

document.addEventListener("DOMContentLoaded", async function () {

    if (!document.getElementById("nombre")) return;

    await obtenerUbicacionActual();

    const id = localStorage.getItem("editIndex");
    if (id) {
        try {
            const oficina = await consultarOficina(id);
            if (oficina) {
                document.getElementById("nombre").value = oficina.nombre;
                document.getElementById("ubicacion").value = oficina.ubicacion;
                document.getElementById("latitud").value = oficina.latitud || '';
                document.getElementById("longitud").value = oficina.longitud || '';
                document.getElementById("capacidadMaxima").value = oficina.capacidadMaxima || '';

                if (oficina.latitud && oficina.longitud) {
                    actualizarMapa(oficina.latitud, oficina.longitud);
                }
            }
        } catch (error) {
            console.error('Error al cargar oficina:', error);
            mostrarNotificacion('No se pudo cargar la información de la oficina.', 'error');
        }
    }
});

window.guardarOficina = guardarOficina;
window.editarOficina = editarOficina;
window.eliminarOficina = eliminarOficina;
window.verEnMapa = verEnMapa;
window.obtenerUbicacionActual = obtenerUbicacionActual;
window.onCoordenadasChange = onCoordenadasChange;
window.initMap = initMap;