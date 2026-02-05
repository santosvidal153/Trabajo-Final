const botonCrearTransaccion = document.querySelector("#nueva-transaccion");
const modal = document.querySelector("#modal-transaccion");

botonCrearTransaccion.addEventListener("click", ()=> {
    modal.classList.add("is-active");
})