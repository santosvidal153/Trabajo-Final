document.addEventListener('DOMContentLoaded', () => {
  configurarModal();
  configurarFormularioEditar();
});

function configurarModal() {
  function openModal($el) {
    $el.classList.add('is-active');
    cargarDatosPerfil();
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
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
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

}

function configurarFormularioEditar() {
  const btnGuardar = document.getElementById('btn-guardar-perfil');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarCambiosPerfil);
  }
}

async function cargarDatosPerfil() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch('http://localhost:3000/api/perfil', {
      headers: {
        'x-token': token
      }
    });

    if (response.ok) {
      const data = await response.json();
      const perfil = data.data;
    }
  } catch (error) {
    console.error('Error cargando datos del perfil:', error);
  }
}