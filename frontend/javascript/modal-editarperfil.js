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

async function guardarCambiosPerfil() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '../pages/login.html';
      return;
    }

    const nombre = document.getElementById('perfil-nombre').value.trim();
    const pais = document.getElementById('perfil-pais').value.trim();
    const ciudad = document.getElementById('perfil-ciudad').value.trim();

    if (nombre) {
      if (nombre.length < 3) {
        mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
        return;
      }

      if (nombre.length > 50) {
        mostrarMensaje('El nombre no puede tener más de 50 caracteres', 'error');
        return;
      }

      //validar que solo contenga letras, espacios y caracteres especiales comunes
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nombreRegex.test(nombre)) {
        mostrarMensaje('El nombre solo puede contener letras y espacios', 'error');
        return;
      }
    }

    if (pais) {
      if (pais.length < 2) {
        mostrarMensaje('El país debe tener al menos 2 caracteres', 'error');
        return;
      }

      if (pais.length > 30) {
        mostrarMensaje('El país no puede tener más de 30 caracteres', 'error');
        return;
      }

      const ubicacionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/;
      if (!ubicacionRegex.test(pais)) {
        mostrarMensaje('El país solo puede contener letras y espacios ', 'error');
        return;
      }
    }

    if (ciudad) {
      if (ciudad.length < 2) {
        mostrarMensaje('La ciudad debe tener al menos 2 caracteres', 'error');
        return;
      }

      if (ciudad.length > 30) {
        mostrarMensaje('La ciudad no puede tener más de 30 caracteres', 'error');
        return;
      }

      //validar que solo contenga letras, espacios y guiones
      const ubicacionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/;
      if (!ubicacionRegex.test(ciudad)) {
        mostrarMensaje('La ciudad solo puede contener letras y espacios', 'error');
        return;
      }
    }

    const response = await fetch('http://localhost:3000/api/perfil', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({ nombre, pais, ciudad })
    });

    if (response.ok) {
      const modal = document.getElementById('modal-js-example');
      if (modal) modal.classList.remove('is-active');
      setTimeout(() => location.reload(), 1000);
    } else {
      const error = await response.json();
      mostrarMensaje(error.error || 'Error actualizando perfil', 'error');
    }
  } catch (error) {
    console.error('Error guardando cambios del perfil:', error);
    mostrarMensaje('Error guardando cambios del perfil', 'error');
  }
}

function mostrarMensaje(mensaje, tipo) {
  alert(mensaje);
}