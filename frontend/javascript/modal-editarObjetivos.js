document.addEventListener('DOMContentLoaded', () => {
    configurarModalEditar();
});

function configurarModalEditar() {
    function openModal($el) {
        $el.classList.add('is-active');
    }

    function closeModal($el) {
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        
        if (modal === 'modal-editar-objetivo') {
            const $target = document.getElementById(modal);
            
            if ($target) {
                $trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const objetivoId = $trigger.id.replace('editar-', '');
                    
                    cargarObjetivoParaEdicion(objetivoId).then(() => {
                        openModal($target);
                    });
                });
            } else {
                console.error('No se encontró el modal:', modal);
            }
        }
    });

    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    document.addEventListener('keydown', (event) => {
        if(event.key === "Escape") {
            closeAllModals();
        }
    });
    
    const btnGuardar = document.getElementById('btn-guardar-objetivo');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            guardarCambiosObjetivo();
        });
    }
    
    // Configurar el submit del formulario
    const form = document.getElementById('form-editar-objetivo');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarCambiosObjetivo();
        });
    }
}

async function cargarObjetivoParaEdicion(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }
        
        const response = await fetch(`http://localhost:3000/api/objetivos/${id}`, {
            headers: {
                'x-token': token,
                'Content-Type': 'application/json'
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
        
        if (data.data) {
            const objetivo = data.data;
            
            document.getElementById('objetivo-nombre').value = objetivo.nombre || '';
            document.getElementById('objetivo-monto').value = objetivo.monto || '';
            document.getElementById('objetivo-descripcion').value = objetivo.descripcion || '';
            
            const form = document.getElementById('form-editar-objetivo');
            if (form) {
                form.dataset.objetivoId = id;
                window.objetivoEditandoId = id;
            }
            
        } else {
            alert('No se encontró el objetivo a editar');
        }
    } catch (error) {
        console.error(error);
        alert('Error al cargar el objetivo para editar');
    }
}

async function guardarCambiosObjetivo() {
    
    const form = document.getElementById('form-editar-objetivo');
    
    if (!form) {
        return;
    }
    
    const objetivoId = form.dataset.objetivoId;
    
    if (!objetivoId) {
        alert('Error: No se pudo identificar el objetivo a editar');
        return;
    }
    
    const objetivo = {
        nombre: document.getElementById('objetivo-nombre').value,
        monto: parseFloat(document.getElementById('objetivo-monto').value),
        descripcion: document.getElementById('objetivo-descripcion').value
    };
    
    
    if (!objetivo.nombre || !objetivo.monto || objetivo.monto <= 0) {
        alert('Por favor completa los campos obligatorios: nombre y monto');
        return;
    }
    
    const resultado = await window.actualizarObjetivo(objetivoId, objetivo);
    
    if (resultado.success) {
        const modal = document.getElementById('modal-editar-objetivo');
        if (modal) {
            modal.classList.remove('is-active');
        }
        
        alert('Objetivo actualizado correctamente');
    } else {
        alert('Error al actualizar el objetivo');
    }
}