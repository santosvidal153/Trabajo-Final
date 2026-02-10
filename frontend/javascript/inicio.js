//const usuarioId = localStorage.getItem("usuario_id");
const usuarioId = 1;

const mostrarBienvenida = async () => {
    try {
        const url = `http://localhost:3000/usuario/${usuarioId}`
        const response = await fetch(url);
        const data =  await response.json();
        const nombre = data.nombre;
        const espSaludo = document.querySelector("#saludo-inicio")
        const saludo = espSaludo.querySelector(".hero-body");
        saludo.innerHTML = `
          <p class="title">Hola, ${nombre}!</p>
          <p class="subtitle">Tus gastos por categoría:</p>`
    }
    catch (err) {
        console.error;
        alert(err.message);
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    mostrarBienvenida();
})


