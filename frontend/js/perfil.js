document.addEventListener('DOMContentLoaded', function() {
    inicializarPerfil();
});

function inicializarPerfil() {
    cargarDatosPerfil();
    
    configurarEventListeners();
    
    cargarInformacionUsuario();
}

//cargar datos del perfil
async function cargarDatosPerfil() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = '../pages/login.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/perfil', {
            headers: {
                'x-token': token
            }
        });

        if (response.ok) {
            const data = await response.json();
            actualizarInterfazPerfil(data.data);
        } else if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '../pages/login.html';
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al cargar el perfil', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}