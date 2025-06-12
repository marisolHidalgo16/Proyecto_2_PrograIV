async function cargarOficinas() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/oficinas', {
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
        let tbody = document.getElementById("oficinas-list");
        tbody.innerHTML = "";

        if (oficinas.length === 0) {
            document.getElementById("mensaje-vacio").style.display = "block";
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay oficinas registradas aún.</td></tr>`;
            return;
        } else {
            document.getElementById("mensaje-vacio").style.display = "none";
        }

        oficinas.forEach((oficina) => {
            let fila = `<tr>
                <td>${oficina.idOficina}</td>
                <td>${oficina.nombre}</td>
                <td>${oficina.ubicacion}</td>
                <td>
                    <button onclick="editarOficina(${oficina.idOficina})" class="btn btn-warning">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarOficina(${oficina.idOficina})" class="btn btn-danger">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>`;
            tbody.innerHTML += fila;
        });
    } catch (error) {
        console.error('Error al cargar oficinas:', error);
        alert('No se pudieron obtener las oficinas. Verifique su conexión.');
    }
}

async function eliminarOficina(index) {
    let oficina = await consultarOficina(index);

    if (oficina && confirm(`¿Está seguro de eliminar la oficina ${oficina.nombre}?`)) {
        const token = localStorage.getItem("jwt");

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/${index}`, {
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

            alert("Oficina eliminada correctamente");
            cargarOficinas();
        } catch (error) {
            console.error('Error al eliminar oficina:', error);
            alert('No se pudo eliminar la oficina. ¡Algo salió mal!');
        }
    }
}

async function consultarOficina(index) {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/oficinas/${index}`, {
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
        ubicacion: document.getElementById("ubicacion").value
    };

    const token = localStorage.getItem("jwt");
    let index = localStorage.getItem("editIndex");

    let url = index ? `http://127.0.0.1:8080/api/oficinas/${index}` : 'http://127.0.0.1:8080/api/oficinas';
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

        alert(index ? "Oficina actualizada correctamente" : "Oficina creada correctamente");
        localStorage.removeItem("editIndex");
        window.location.href = "oficinaIndex.html";
    } catch (error) {
        console.error('Error al guardar oficina:', error);
        alert('No se pudo guardar la oficina. Verifique su conexión.');
    }
}