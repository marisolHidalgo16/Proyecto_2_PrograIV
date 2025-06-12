async function login(event) {
    event.preventDefault();

    let form = event.target;
    if(!form.checkValidity()){
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const respuesta = await fetch("http://127.0.0.1:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || "Credenciales incorrectas");
        }


        const data = await respuesta.json();

        localStorage.setItem("jwt", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        console.log("Login exitoso:", data);
        window.location.href = "personaIndex.html";
    } catch (error) {
        console.error("Error en login:", error);
        alert("Error: " + error.message);
    }
}

function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

function verificarAutenticacion() {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "login.html";
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem("jwt");
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

(function () {
    'use strict'

    var forms = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()


