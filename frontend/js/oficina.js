// Función para mostrar estado de carga
function mostrarCargandoOficinas() {
    const tbody = document.getElementById("oficinas-list");
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

async function cargarOficinas() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    // Mostrar estado de carga
    mostrarCargandoOficinas();

    try {
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
        mostrarOficinas(oficinas);

    } catch (error) {
        console.error('Error al cargar oficinas:', error);

        // Mostrar error en la tabla
        const tbody = document.getElementById("oficinas-list");
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
                    <p class="mt-2 mb-0">Error al cargar las oficinas</p>
                    <small class="text-muted">Verifique su conexión a internet</small>
                </td>
            </tr>
        `;

        alert('No se pudieron obtener las oficinas. Verifique su conexión.');
    }
}

function mostrarOficinas(oficinas) {
    const tbody = document.getElementById("oficinas-list");
    const totalElement = document.getElementById("total-oficinas");

    if (totalElement) {
        totalElement.textContent = `${oficinas.length} oficina${oficinas.length !== 1 ? 's' : ''}`;
    }

    tbody.innerHTML = "";

    if (oficinas.length === 0) {
        const mensajeVacio = document.getElementById("mensaje-vacio");
        if (mensajeVacio) mensajeVacio.style.display = "block";

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
    } else {
        const mensajeVacio = document.getElementById("mensaje-vacio");
        if (mensajeVacio) mensajeVacio.style.display = "none";
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
                <div class="btn-group" role="group">
                    ${oficina.latitud && oficina.longitud ?
            `<button onclick="verEnMapa(${oficina.latitud}, ${oficina.longitud}, '${oficina.nombre.replace(/'/g, "\\'")}')" 
                                class="btn btn-info btn-sm" title="Ver en Mapa">
                            <i class="bi bi-map"></i>
                        </button>` : ''
        }
                    <button onclick="editarOficina(${oficina.idOficina})" class="btn btn-warning btn-sm" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="eliminarOficina(${oficina.idOficina})" class="btn btn-danger btn-sm" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
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
        console.log('Modal mostrado, inicializando mapa...'); // Debug

        setTimeout(() => {
            try {
                if (typeof google === 'undefined' || !google.maps) {
                    console.error('Google Maps no está disponible');
                    document.getElementById('modalMap').innerHTML =
                        '<div class="alert alert-warning">Google Maps no está disponible. <br>Verifica tu conexión a internet y la API Key.</div>';
                    return;
                }

                const mapContainer = document.getElementById('modalMap');
                console.log('Contenedor del mapa:', mapContainer); // Debug

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

                console.log('Mapa inicializado correctamente'); // Debug

            } catch (error) {
                console.error('Error inicializando mapa:', error);
                document.getElementById('modalMap').innerHTML =
                    '<div class="alert alert-danger">Error al cargar el mapa: ' + error.message + '</div>';
            }
        }, 300); // Pausa de 300ms
    });

    modal.show();
}

async function eliminarOficina(index) {
    let oficina = await consultarOficina(index);

    if (oficina && confirm(`¿Está seguro de eliminar la oficina "${oficina.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        const token = localStorage.getItem("jwt");

        try {
            const respuesta = await fetch(`http://localhost:8080/api/oficinas/${index}`, {
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

            alert(`✅ Oficina "${oficina.nombre}" eliminada correctamente`);
            cargarOficinas();
        } catch (error) {
            console.error('Error al eliminar oficina:', error);
            alert('❌ No se pudo eliminar la oficina. ¡Algo salió mal!');
        }
    }
}

async function consultarOficina(index) {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://localhost:8080/api/oficinas/${index}`, {
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
        console.error('Error al obtener oficina:', error);
        alert('No pudimos obtener los datos de esta oficina.');
        return null;
    }
}

function editarOficina(index) {
    localStorage.setItem("editIndex", index);
    window.location.href = "formOficina.html";
}

async function guardarOficina(event) {
    event.preventDefault();

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

    console.log('Enviando oficina:', oficina); // Debug

    const token = localStorage.getItem("jwt");
    let index = localStorage.getItem("editIndex");

    let url = index ? `http://localhost:8080/api/oficinas/${index}` : 'http://localhost:8080/api/oficinas';
    let metodo = index ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(oficina)
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

        alert(index ?
            `✅ Oficina "${oficina.nombre}" actualizada correctamente` :
            `✅ Oficina "${oficina.nombre}" creada correctamente`
        );
        localStorage.removeItem("editIndex");
        window.location.href = "oficinaIndex.html";
    } catch (error) {
        console.error('Error al guardar oficina:', error);
        alert('❌ No se pudo guardar la oficina. Verifique su conexión.');
    }
}