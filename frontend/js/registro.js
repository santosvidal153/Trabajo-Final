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

