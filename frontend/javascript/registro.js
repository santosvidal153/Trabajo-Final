document.addEventListener('DOMContentLoaded', function() {
    inicializarRegistro();
});

function inicializarRegistro() {
    configurarEventListeners();
    configurarValidaciones();
}

function configurarEventListeners() {
    const formulario = document.getElementById('formulario');
    if (formulario) {
        formulario.addEventListener('submit', handleRegistro);
    }
    
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    const botonLogin = document.getElementById("botonLogin");
    if (botonLogin) {
        botonLogin.addEventListener("click", () => {
            window.location.href = './login.html';
        });
    }
}

function configurarValidaciones() {
    crearMensajeError('nombre', 'textNombre');
    crearMensajeError('email', 'textEmail');
    crearMensajeError('password', 'textPassword');
    crearMensajeError('pais', 'textPais');
}

function crearMensajeError(campo, id) {
    if (!document.getElementById(id)) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.id = id;
        mensajeDiv.style.color = 'red';
        mensajeDiv.style.fontSize = '0.75rem';
        mensajeDiv.style.marginTop = '0.25rem';
        
        const input = document.querySelector(`input[name="${campo === 'password' ? 'contrasena' : campo}"]`);
        if (input && input.parentNode) {
            input.parentNode.appendChild(mensajeDiv);
        }
    }
}

function validarNombre() {
    const nombre = document.querySelector('input[name="nombre"]').value;
    const mensaje = document.getElementById('textNombre');
    const LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)+$/;
    
    if (nombre === '') {
        mensaje.textContent = 'Es obligatorio colocar un nombre';
        return false;
    } else if (nombre.length < 3) {
        mensaje.textContent = 'El nombre debe tener al menos 3 caracteres';
        return false;
    } else if (nombre.length > 60) {
        mensaje.textContent = 'El nombre debe tener máximo 60 caracteres';
        return false;
    } else if (!LETTERS_REGEX.test(nombre)) {
        mensaje.textContent = 'Debe incluir nombre y apellido';
        return false;
    } else {
        mensaje.textContent = '';
        return true;
    }
}

function validarEmail() {
    const email = document.querySelector('input[name="email"]').value;
    const mensaje = document.getElementById('textEmail');
    const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
    
    if (email === '') {
        mensaje.textContent = 'Es obligatorio colocar un email';
        return false;
    } else if (email.length > 255 || !EMAIL_REGEX.test(email)) {
        mensaje.textContent = 'La estructura del correo es inválida';
        return false;
    } else {
        mensaje.textContent = '';
        return true;
    }
}

function validarPassword() {
    const password = document.querySelector('input[name="contrasena"]').value;
    const mensaje = document.getElementById('textPassword');
    
    if (password === '') {
        mensaje.textContent = 'Es obligatorio colocar una contraseña';
        return false;
    } else if (password.length < 8) {
        mensaje.textContent = 'La contraseña debe tener al menos 8 caracteres';
        return false;
    } else {
        mensaje.textContent = '';
        return true;
    }
}

function validarPais() {
    const pais = document.querySelector('input[name="pais"]').value;
    const mensaje = document.getElementById('textPais');
    const PAIS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?$/;
    
    if (pais === '') {
        mensaje.textContent = 'Es obligatorio colocar un país';
        return false;
    } else if (pais.length < 2) {
        mensaje.textContent = 'El país debe tener más de 2 letras';
        return false;
    } else if (!PAIS_REGEX.test(pais)) {
        mensaje.textContent = 'El país solo puede contener letras';
        return false;
    } else {
        mensaje.textContent = '';
        return true;
    }
}

async function handleRegistro(e) {
    e.preventDefault();

    const esNombreValido = validarNombre();
    const esEmailValido = validarEmail();
    const esPasswordValido = validarPassword();
    const esPaisValido = validarPais();

    if (!esNombreValido || !esEmailValido || !esPasswordValido || !esPaisValido) {
        mostrarError('Revisa los campos marcados');
        return;
    }

    const nombre = document.querySelector('input[name="nombre"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const contrasena = document.querySelector('input[name="contrasena"]').value;
    const pais = document.querySelector('input[name="pais"]').value;

    const datos = {
        nombre,
        email,
        contrasena,
        pais
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/perfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });


        if (respuesta.ok) {
            mostrarExito('Registro exitoso');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } else if (respuesta.status === 409) {
            const resData = await respuesta.json();
            console.log('Error 409 - Datos duplicados:', resData);
            const mensajeNombre = document.getElementById('textNombre');
            const mensajeEmail = document.getElementById('textEmail');

            mensajeNombre.textContent = resData.error || '';
            mensajeEmail.textContent = resData.error || '';
        } else if (respuesta.status === 422) {
            const resData = await respuesta.json();
            console.log('Error 422 - Validación fallida:', resData);
            mostrarError(resData.error || 'Verifica los datos ingresados');
        } else {
            mostrarError('No se pudo completar el registro');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        mostrarError('Error de conexión');
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.querySelector('input[name="contrasena"]');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

function mostrarError(mensaje) {
    const errorText = document.getElementById('errorLogin');
    
    if (errorText) {
        errorText.textContent = mensaje;
        errorText.style.color = '#f14668';
        errorText.style.fontWeight = 'normal';
        errorText.style.fontSize = '0.875rem';
        
        setTimeout(() => {
            errorText.textContent = '';
        }, 5000);
    }
}

function mostrarExito(mensaje) {
    const errorText = document.getElementById('errorLogin');
    
    if (errorText) {
        errorText.textContent = mensaje;
        errorText.style.color = '#48c774'; 
        errorText.style.fontWeight = 'normal';
        errorText.style.fontSize = '0.875rem';
        
        setTimeout(() => {
            errorText.textContent = '';
        }, 5000);
    }
}