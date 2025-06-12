async function cargarPersonas() {
    const token = localStorage.getItem("jwt");

    if (!token) {
        alert("No estás autenticado. Por favor inicia sesión.");
        window.location.href = "login.html";
        return;
    }

    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/personas', {
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

        const personas = await respuesta.json();
        let tbody = document.getElementById("personas-list");
        tbody.innerHTML = "";

        if (personas.length === 0) {
            document.getElementById("mensaje-vacio").style.display = "block";
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay personas registradas aún.</td></tr>`;
            return;
        } else {
            document.getElementById("mensaje-vacio").style.display = "none";
        }

        personas.forEach((persona) => {
            let oficinaNombre = persona.oficina ? persona.oficina.nombre : 'Sin oficina';
            let fila = `<tr>
                <td>${persona.idAuto}</td>
                <td>${persona.idUsuario}</td>
                <td>${persona.nombre}</td>
                <td>${persona.email}</td>
                <td>${persona.direccion}</td>
                <td>${persona.fechaNacimiento}</td>
                <td>
                    <button onclick="editarPersona(${persona.idAuto})" class="btn btn-warning">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button onclick="eliminarPersona(${persona.idAuto})" class="btn btn-danger">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>`;
            tbody.innerHTML += fila;
        });
    } catch (error) {
        console.error('Error al cargar personas:', error);
        alert('No se pudieron obtener las personas. Verifique su conexión.');
    }
}

async function eliminarPersona(index) {
    let persona = await consultarPersona(index);

    if (persona && confirm(`¿Está seguro de eliminar a ${persona.nombre}?`)) {
        const token = localStorage.getItem("jwt");

        try {
            const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/${index}`, {
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
            cargarPersonas();
        } catch (error) {
            console.error('Error al eliminar persona:', error);
            alert('No se pudo eliminar la persona. ¡Algo salió mal!');
        }
    }
}

async function consultarPersona(index) {
    const token = localStorage.getItem("jwt");

    try {
        const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/${index}`, {
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
        let select = document.getElementById("oficina");
        select.innerHTML = '<option value="">Seleccione una oficina</option>';

        oficinas.forEach(oficina => {
            let option = document.createElement('option');
            option.value = oficina.idOficina;  // Usar idOficina
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
            const respuesta = await fetch(`http://127.0.0.1:8080/api/personas/${id}`, {
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
            idOficina: parseInt(oficinaId)  // Usar idOficina y convertir a número
        }
    };

    const token = localStorage.getItem("jwt");
    let index = localStorage.getItem("editIndex");

    let url = index ? `http://127.0.0.1:8080/api/personas/${index}` : 'http://127.0.0.1:8080/api/personas';
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