document.addEventListener('DOMContentLoaded', function() {
    inicializarObjetivos();
});

function inicializarObjetivos() {
    cargarObjetivos();
    configurarEventListeners();
}

//funcion para crear objetivo
async function crearObjetivo(objetivo) {
    try {        
        const response = await fetch('http://localhost:3000/api/objetivos', {
            method: 'POST',
            headers: {
                'x-token': localStorage.getItem('token') || 'user-1',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objetivo)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.message) {
            await cargarObjetivos();
        } else {
            console.error(error);
            alert('Error creando objetivo: ' + data.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al crear objetivo');
    }
}

//funcion para editar objetivo
async function actualizarObjetivo(id, objetivo) {
    try {
        const response = await fetch(`http://localhost:3000/api/objetivos/${id}`, {
            method: 'PUT',
            headers: {
                'x-token': localStorage.getItem('token') || 'user-1',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objetivo)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.message) {
            await cargarObjetivos();
        } else {
            console.error(error);
            alert('Error actualizando objetivo: ' + data.message);
        }
    } catch (error) {
        alert('Error de conexión al actualizar objetivo');
    }
}

//funcion para eliminar objetivo
async function eliminarObjetivo(id) {
    try {        
        if (!confirm('¿Estás seguro de que quieres eliminar este objetivo? Se reembolsará el dinero ahorrado a tu saldo.')) {
            return { success: false, message: 'Cancelado por usuario' };
        }
        
        const response = await fetch(`http://localhost:3000/api/objetivos/${id}`, {
            method: 'DELETE',
            headers: {
                'x-token': localStorage.getItem('token') || 'user-1'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.message) {
            alert(data.message);
            await cargarObjetivos();
            return { success: true, data: data.data };
        } else {
            alert('Error eliminando objetivo: ' + data.message);
            return { success: false, message: data.message };
        }
    } catch (error) {
        alert('Error de conexión al eliminar objetivo');
        return { success: false, message: error.message };
    }
}

//funcion para cargar objetivos
async function cargarObjetivos() {    
    try {
        const response = await fetch('http://localhost:3000/api/objetivos', {
            headers: {
                'x-token': localStorage.getItem('token') || 'user-1'
            }
        });
        
        const data = await response.json();
        
        if (data.data) {
            mostrarSaldo(data.saldo);
            renderizarObjetivos(data.data);
        } else {
            alert('Error cargando objetivos');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}
