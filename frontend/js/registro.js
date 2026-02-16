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
    const inputNombre = document.querySelector('input[name="nombre"]');
    const inputEmail = document.querySelector('input[name="email"]');
    const inputPassword = document.querySelector('input[name="contrasena"]');
    const inputPais = document.querySelector('input[name="pais"]');
    
    crearMensajeError('nombre', 'textNombre');
    crearMensajeError('email', 'textEmail');
    crearMensajeError('password', 'textPassword');
    crearMensajeError('pais', 'textPais');
    
    if (inputNombre) {
        inputNombre.addEventListener('input', validarNombre);
    }
    
    if (inputEmail) {
        inputEmail.addEventListener('input', validarEmail);
    }
    
    if (inputPassword) {
        inputPassword.addEventListener('input', validarPassword);
    }
    
    if (inputPais) {
        inputPais.addEventListener('input', validarPais);
    }
}

function crearMensajeError(campo, id) {
    if (!document.getElementById(id)) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.id = id;
        mensajeDiv.className = 'help is-danger';
        mensajeDiv.style.fontSize = '0.75rem';
        mensajeDiv.style.marginTop = '0.25rem';
        
        const input = document.querySelector(`input[name="${campo === 'password' ? 'contrasena' : campo}"]`);
        if (input && input.parentNode) {
            input.parentNode.appendChild(mensajeDiv);
        }
    }
}
