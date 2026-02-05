const botonCrearTransaccion = document.querySelector("#nueva-transaccion");
const modal = document.querySelector("#modal-transaccion");
const botonCerrar = document.querySelector("#cerrar-modal");
const botonCancelar = document.querySelector("#cancelar-form");
const botonGuardar = document.querySelector("#guardar-form");

botonCrearTransaccion.addEventListener("click", (e)=> {
    modal.classList.add("is-active");
})

botonCerrar.addEventListener("click", (e)=> {
    modal.classList.remove("is-active");
})

botonCancelar.addEventListener("click", (e)=> {
    modal.classList.remove("is-active");
})

botonGuardar.addEventListener("click", (e)=> {
    modal.classList.remove("is-active");
})