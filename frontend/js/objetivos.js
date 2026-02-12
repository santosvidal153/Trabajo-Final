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
    
    if (objetivo.estado_dinamico) {
        estado = objetivo.estado_dinamico.estado;
        porcentaje = objetivo.estado_dinamico.porcentaje;
    } else {
        estado = objetivo.estado;
        porcentaje = Math.round((objetivo.actual / objetivo.monto) * 100);
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
            <img src="${objetivo.imagen}" alt="${objetivo.nombre}">
            <div class="p-4">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                    <span class="etiqueta-categoria">${objetivo.categoria}</span>
                    <div class="is-flex is-gap-0-5">
                        <button class="boton-editar px-2 py-1" id="editar-${objetivo.id}">Editar</button>
                        <button class="boton-eliminar px-2 py-1" id="eliminar-${objetivo.id}">Eliminar</button>
                    </div>
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
            <img src="${objetivo.imagen}" alt="${objetivo.nombre}">
            <div class="p-4">
                <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
                    <span class="etiqueta-categoria">${objetivo.categoria}</span>
                    ${estado === 'completado' ? 
                        `<span class="etiqueta-completado">Completado</span>` :
                        `<div class="is-flex is-gap-0-5">
                            <button class="boton-editar px-2 py-1" id="editar-${objetivo.id}" onclick="editarObjetivo(${objetivo.id})">Editar</button>
                            <button class="boton-eliminar px-2 py-1" id="eliminar-${objetivo.id}" onclick="eliminarObjetivo(${objetivo.id})">Eliminar</button>
                        </div>`
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
                    ${estado === 'completado' ?
                        `<span class="completado">¡Completado!</span>` :
                        `<span class="falta">Faltan $${(parseFloat(objetivo.monto) - parseFloat(objetivo.actual)).toFixed(2)}</span>`
                    }
                </p>
            </div>
        `;
        
        //agregar botones según estado
        if (estado === 'progreso') {
            tarjeta.querySelector('.p-4').innerHTML += `
                <button class="boton-comprar" onclick="agregarFondos(${objetivo.id})">Ahorrar</button>
            `;
        }
        
        if (estado === 'listo') {
            tarjeta.querySelector('.p-4').innerHTML += `
                <button class="boton-comprar" onclick="completarObjetivo(${objetivo.id})">Comprar</button>
            `;
        }
        
        if (estado === 'completado') {
            tarjeta.querySelector('.p-4').innerHTML += `
                <button class="boton-detalles" onclick="verDetalles(${objetivo.id})">Ver Detalles</button>
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

//funcion para mostrar saldo
function mostrarSaldo(saldo) {
    let saldoElement = document.getElementById('saldo-usuario');
    
    if (!saldoElement) {
        const encabezado = document.querySelector('.encabezado-pagina');
        if (encabezado) {
            const saldoDiv = document.createElement('div');
            saldoDiv.className = 'saldo-usuario';
            saldoDiv.innerHTML = `
                <div class="saldo-info">
                    <span class="saldo-label">Saldo disponible:</span>
                    <span class="saldo-amount" id="saldo-usuario">$${parseFloat(saldo).toFixed(2)}</span>
                </div>
            `;
            const titulo = encabezado.querySelector('.titulo-objetivo');
            if (titulo) {
                titulo.insertAdjacentElement('afterend', saldoDiv);
            }
            saldoElement = document.getElementById('saldo-usuario');
        }
    }
    
    if (saldoElement) {
        saldoElement.textContent = `$${parseFloat(saldo).toFixed(2)}`;
    }
}