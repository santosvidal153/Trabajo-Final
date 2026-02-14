//actualizar requeridos según categoría seleccionada
function actualizarRequeridos() {
    const categoriaSelect = document.getElementById('obj-categoria');
    
    if (categoriaSelect) {
        const selectedOption = categoriaSelect.options[categoriaSelect.selectedIndex];
        const requeridos = selectedOption.getAttribute('data-requeridos');
        console.log('Categoría seleccionada:', selectedOption.value, 'Requeridos:', requeridos);
    }
}

function configurarModalEventListeners() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const $trigger = document.querySelector(`[data-target="${modal.id}"]`);
        const $close = modal.querySelector('.delete, .modal-close');
        
        if ($trigger) {
            $trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openModal(modal);
            });
        }
        
        if ($close) {
            $close.addEventListener('click', () => {
                closeModal(modal);
            });
        }
    });
    
    document.addEventListener('keydown', (event) => {
        if(event.key === "Escape") {
            closeAllModals();
        }
    });
}

//manejar el envío del formulario
async function handleSubmitForm(e) {
    e.preventDefault();
    
    const form = e.target || document.getElementById('form-nuevo-objetivo');
    if (!form) {
        console.error('No se encontró el formulario');
        return;
    }
    
    const formData = new FormData(form);
    const categoriaSelect = document.getElementById('obj-categoria');
    const selectedOption = categoriaSelect.options[categoriaSelect.selectedIndex];
    
    const objetivo = {
        nombre: formData.get('nombre'),
        monto: parseFloat(formData.get('monto')),
        actual: parseFloat(formData.get('actual')) || 0,
        categoria: formData.get('categoria'),
        descripcion: formData.get('descripcion'),
        requeridos: parseInt(selectedOption.getAttribute('data-requeridos')) || 0
    };
    
    if (!objetivo.nombre || !objetivo.monto || objetivo.monto <= 0 || !objetivo.categoria) {
        alert('Por favor completa los campos obligatorios: nombre, monto y categoría');
        return;
    }
    
    const objetivoId = form.dataset.objetivoId;
    
    if (objetivoId) {
        await actualizarObjetivo(objetivoId, objetivo);
    } else {
        await crearObjetivo(objetivo);
    }
    
    // Cerrar modal después de crear/editar
    const modal = document.getElementById('modal-js-example');
    if (modal) {
        closeModal(modal);
    }
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('is-active');
        document.body.classList.add('is-clipped');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('is-active');
        document.body.classList.remove('is-clipped');
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        closeModal(modal);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    configurarModalEventListeners();
    actualizarRequeridos();
    
    const form = document.getElementById('form-nuevo-objetivo');
    if (form) {
        form.addEventListener('submit', handleSubmitForm);
    }
});