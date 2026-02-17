document.addEventListener('DOMContentLoaded', function() {
    inicializarLogin();
});

function inicializarLogin() {
    configurarEventListeners();
}

function configurarEventListeners() {
    const formulario = document.getElementById('formulario');
    if (formulario) {
        formulario.addEventListener('submit', handleLogin);
    }
    
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.querySelector('input[name="email"]').value;
    const contrasena = document.querySelector('input[name="contrasena"]').value;
    
    if (!email || !contrasena) {
        mostrarError('Por favor completa todos los campos');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/perfil/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, contrasena })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioLogueado', email);
            
            window.location.href = './inicio.html';
        } else {
            const error = await response.json();
            mostrarError(error.error || 'Error al iniciar sesión');
        }
    } catch (error) {
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
    const errorDiv = document.querySelector('.notification');
    const errorText = document.getElementById('errorLogin');
    
    if (errorDiv && errorText) {
        errorText.textContent = mensaje;
        errorDiv.classList.remove('is-hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('is-hidden');
        }, 3000);
    }
}