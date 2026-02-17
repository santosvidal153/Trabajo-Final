document.addEventListener('DOMContentLoaded', function() {
    inicializarObjetivos();
});

function inicializarObjetivos() {
    cargarObjetivos();
    configurarEventListeners();
}

//funcion para crear objetivo
async function crearObjetivo(objetivo) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }    
    const response = await fetch('http://localhost:3000/api/objetivos', {
        method: 'POST',
        headers: {
            'x-token': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objetivo)
    });
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'inicio.html';
        return;
    }
        
    const data = await response.json();
        
    if (data.message) {
        await cargarObjetivos();
    } else {
        console.error(data);
        alert('Error creando objetivo: ' + data.message);
    }
}

//funcion para editar objetivo
async function actualizarObjetivo(id, objetivo) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }
        const response = await fetch(`http://localhost:3000/api/objetivos/${id}`, {
            method: 'PUT',
            headers: {
                'x-token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objetivo)
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'inicio.html';
            return;
        }
        
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
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }
        
        const response = await fetch(`http://localhost:3000/api/objetivos/${id}`, {
            method: 'DELETE',
            headers: {
                'x-token': token
            },
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'inicio.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.message) {
            alert(data.message);
            await cargarObjetivos();
            return;
        } else {
            alert('Error eliminando objetivo: ' + data.message);
            return;
        }
    } catch (error) {
        alert('Error de conexión al eliminar objetivo');
        return;
    }
}

//funcion para cargar objetivos
async function cargarObjetivos() {    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }
        
        const response = await fetch(`http://localhost:3000/api/objetivos`, {
            headers: {
                'x-token': token,
            },
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'inicio.html';
            return;
        }
        
        const data = await response.json();
        
        if (data.data) {
            await cargarTransaccionesAhorro();
            renderizarObjetivos(data.data);
            if (typeof configurarModalEditar === 'function') {
                configurarModalEditar();
            }
        } else {
            alert('Error cargando objetivos');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

//funcion para cargar transacciones de ahorro y actualizar objetivos
async function cargarTransaccionesAhorro() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }
        const response = await fetch(`http://localhost:3000/transacciones`, {
            headers: {
                'x-token': token
            },
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'inicio.html';
            return;
        }
        
        if (!response.ok) {
            console.error('Error cargando transacciones de ahorro:', response.status, response.statusText);
            return;
        }
        
        const transacciones = await response.json();
        procesarTransaccionesAhorro(transacciones);
        
    } catch (error) {
        console.error('Error de conexión al cargar transacciones:', error);
    }
}

function procesarTransaccionesAhorro(transacciones) {
    const transaccionesAhorro = transacciones.filter(trans => 
        trans.categoria === 'ahorro' && trans.objetivo_id
    );
    
    const ahorrosPorObjetivo = {};
    transaccionesAhorro.forEach(trans => {
        if (!ahorrosPorObjetivo[trans.objetivo_id]) {
            ahorrosPorObjetivo[trans.objetivo_id] = 0;
        }
        ahorrosPorObjetivo[trans.objetivo_id] += parseFloat(trans.monto);
    });
    
    window.ahorrosTransacciones = ahorrosPorObjetivo;
}

function renderizarObjetivos(objetivos) {
    const contenedor = document.querySelector('.cuadricula-objetivos');
    contenedor.innerHTML = '';
    
    objetivos.forEach(objetivo => {
        const tarjeta = crearTarjetaObjetivo(objetivo);
        contenedor.appendChild(tarjeta);
    });
}

function crearTarjetaObjetivo(objetivo) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-objetivo';
    tarjeta.dataset.objetivoId = objetivo.id;
    
    //obtener el estado del objetivo
    let estado;
    let porcentaje;

    let montoActual = parseFloat(objetivo.actual) || 0;
    
    porcentaje = Math.round((montoActual / objetivo.monto) * 100);
    
    if (porcentaje >= 100) {
        if (objetivo.estado_dinamico.estado === 'completado') {
            estado = 'completado';  
        } else {
            estado = 'listo';       
        }
    } else if (objetivo.estado_dinamico.estado === 'bloqueado') {
        estado = 'bloqueado';
    } else {
        estado = 'progreso';
    }

    function getContenidoSuperiorDerecho(estado, objetivo) {
        if (estado === 'completado' || estado === 'listo') {
            return '<span class="etiqueta-completado">Completado</span>';
        } else {
            return `<div class="is-flex is-gap-0-5"><button class="boton-editar px-2 py-1 js-modal-trigger" id="editar-${objetivo.id}" data-target="modal-editar-objetivo">Editar</button><button class="boton-eliminar px-2 py-1" id="eliminar-${objetivo.id}" onclick="eliminarObjetivo('${objetivo.id}')">Eliminar</button></div>`;
        }
    }

    function getMensajeProgreso(estado, objetivo, montoActual) {
        if (estado === 'completado') {
            return '<span class="completado">Completado</span>';
        } else {
            const montoFaltante = parseFloat(objetivo.monto) - montoActual;
            return `<span class="falta">Faltan $${montoFaltante.toFixed(2)}</span>`;
        }
    }
    
    if (estado === 'bloqueado') {
        tarjeta.classList.add('objetivo-bloqueado');
        const mensaje = `Completa ${objetivo.requeridos} objetivo(s) para desbloquear`;
        tarjeta.innerHTML = `
            <div class="superposicion-bloqueado is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
                <span class="icon mb-2">
                    <i class="fas fa-lock"></i>
                </span>
                <p class="mensaje-bloqueado has-text-centered mx-4">${mensaje}</p>
            </div>
            <img src="../assets/chanchito-ahorra.jpg" alt="alcancia de chanchito">
            <div class="p-4">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                    <span class="etiqueta-categoria">${objetivo.categoria}</span>
                    <span class="etiqueta-bloqueado">Bloqueado</span>
                </div>
                <h3 class="titulo-objetivo mb-2">${objetivo.nombre}</h3>
                <p class="descripcion-objetivo mb-4">${objetivo.descripcion || 'Sin descripción'}</p>
                <div class="mb-4">
                    <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                        <span class="etiqueta-monto">Objetivo</span>
                        <span class="valor-monto">$${parseFloat(objetivo.monto).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        tarjeta.innerHTML = `
            <img src="../assets/chanchito-ahorra.jpg" alt="alcancia de chanchito">
            <div class="p-4">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                    <span class="etiqueta-categoria">${objetivo.categoria}</span>
                    ${getContenidoSuperiorDerecho(estado, objetivo)}
                    }
                </div>
                <h3 class="titulo-objetivo mb-2">${objetivo.nombre}</h3>
                <p class="descripcion-objetivo mb-4">${objetivo.descripcion || 'Sin descripción'}</p>
                <div class="mb-4">
                    <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                        <span class="etiqueta-monto">Objetivo</span>
                        <span class="valor-monto">$${parseFloat(objetivo.monto).toFixed(2)}</span>
                    </div>
                    <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                        <span class="etiqueta-monto">Ahorrado</span>
                        <span class="valor-monto primario">$${parseFloat(objetivo.actual).toFixed(2)}</span>
                    </div>
                </div>
                <progress class="progress ${getProgressClass(estado)}" value="${porcentaje}" max="100">${porcentaje}%</progress>
                <p class="is-flex is-justify-content-space-between is-align-items-center">
                    <span>${porcentaje}%</span>
                    ${getMensajeProgreso(estado, objetivo, montoActual)}
                </p>
            </div>
        `;
        
        if (estado === 'listo') {
            tarjeta.querySelector('.p-4').innerHTML += `
                <button class="boton-comprar" onclick="completarObjetivo(${objetivo.id})">Comprar</button>
            `;
        }
    }
    return tarjeta;
}

function getProgressClass(estado) {
    const clases = {
        'bloqueado': 'is-danger',
        'progreso': 'is-warning',
        'listo': 'is-success',
        'completado': 'is-success'
    };
    return clases[estado];
}

function configurarEventListeners() {
    const btnAniadir = document.querySelector('.btn-aniadir-objetivo');
    if (btnAniadir) {
        btnAniadir.addEventListener('click', mostrarFormularioObjetivo);
    }
}

function editarObjetivo(objetivoId) {
    cargarObjetivoParaEdicion(objetivoId);
}

//funcion para completar objetivo
async function completarObjetivo(objetivoId) {
    const token = localStorage.getItem('token');
    const usuarioId = localStorage.getItem('usuario_id');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres completar este objetivo? Se marcará como comprado y se registrará un gasto en tu historial de transacciones.')) {
        return;
    }

    try {
        
        const responseObjetivo = await fetch(`http://localhost:3000/api/objetivos/${objetivoId}`, {
            headers: {
                'x-token': token
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario_id');
            window.location.href = 'inicio.html';
            return;
        }
        
        if (!responseObjetivo.ok) {
            throw new Error('Error al obtener datos del objetivo');
        }
        
        const dataObjetivo = await responseObjetivo.json();
        const objetivo = dataObjetivo.data;
        
        const transaccionGasto = {
            motivo: `Compra: ${objetivo.nombre}`,
            monto: objetivo.actual.toString(),
            tipo: 'gasto',
            categoria: 'objetivo'
        };
        
        const responseTransaccion = await fetch(`http://localhost:3000/transacciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            },
            body: JSON.stringify(transaccionGasto)
        });
        
        if (!responseTransaccion.ok) {
            const errorData = await responseTransaccion.json();
            throw new Error(`Error al crear transacción: ${errorData.error || 'Error desconocido'}`);
        }

        const responseCompletar = await fetch(`http://localhost:3000/api/objetivos/${objetivoId}/completar`, {
            method: 'PATCH',
            headers: {
                'x-token': token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario_id');
            window.location.href = 'inicio.html';
            return;
        }
        
        const data = await responseCompletar.json();
        
        if (data.message) {
            await cargarObjetivos();
        } else {
            alert('Error completando objetivo');
        }
    } catch (error) {
        console.error(error);
        alert(`Error al completar objetivo: ${error.message}`);
    }
};