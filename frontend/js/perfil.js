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

function actualizarInterfazPerfil(perfil) {
    if (!perfil) return;
    
    const nombreUsuario = document.querySelector('.titulo-usuario');
    const emailUsuario = document.querySelector('.perfil-datos .etiqueta-categoria');
    
    if (nombreUsuario) nombreUsuario.textContent = perfil.nombre || 'Sin nombre';
    if (emailUsuario) emailUsuario.textContent = perfil.email || 'Sin email';
    
    const actualizaciones = [
        { selector: '.info-simple .info-fila:nth-child(1) .info-columna:nth-child(1) .valor-monto', valor: perfil.nombre || 'Sin nombre' },
        { selector: '.info-simple .info-fila:nth-child(1) .info-columna:nth-child(2) .valor-monto', valor: perfil.pais || 'Sin país' },
        { selector: '.info-simple .info-fila:nth-child(2) .info-columna:nth-child(1) .valor-monto', valor: perfil.email || 'Sin email' },
        { selector: '.info-simple .info-fila:nth-child(2) .info-columna:nth-child(2) .valor-monto', valor: perfil.ciudad || 'Sin ciudad' }
    ];
    
    actualizaciones.forEach(({ selector, valor }) => {
        const elemento = document.querySelector(selector);
        if (elemento) elemento.textContent = valor;
    });
}

function configurarEventListeners() {
    const botonEliminar = document.querySelector('.boton-eliminar');
    if (botonEliminar) {
        botonEliminar.addEventListener('click', eliminarCuenta);
    }
    
    const botonCerrarSesion = document.querySelector('.boton-cerrar-sesion');
    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

async function eliminarCuenta() {
    const confirmacion = prompt('Para eliminar tu cuenta, escribe "ELIMINAR" para confirmar:');
    
    if (confirmacion !== 'ELIMINAR') return;
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:3000/api/perfil', {
            method: 'DELETE',
            headers: {
                'x-token': token
            }
        });
        
        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogueado');
            window.location.href = '../pages/login.html';
        } else {
            const responseText = await response.text();
            let error;
            try {
                error = JSON.parse(responseText);
            } catch (e) {
                error = { error: 'Error del servidor al eliminar cuenta' };
            }
            mostrarMensaje(error.error || 'Error eliminando cuenta', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '../pages/login.html';
    }
}

function cargarInformacionUsuario() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/login.html';
        return;
    }
}

function mostrarMensaje(mensaje, tipo) {
    alert(mensaje);
}