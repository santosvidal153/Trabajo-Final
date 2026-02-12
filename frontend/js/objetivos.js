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