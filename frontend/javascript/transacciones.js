const botonCrearTransaccion = document.querySelector("#nueva-transaccion");
const modal = document.querySelector("#modal-transaccion");
const botonCerrar = document.querySelector("#cerrar-modal");
const botonCancelar = document.querySelector("#cancelar-form");
const botonGuardar = document.querySelector("#guardar-form");

//control de botones

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

//control formulario

const AceptacionForm = async (motivo,monto,tipo,categoria) => {
    try {
        const url = "http://localhost:3000/transacciones"
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            },  
        body: JSON.stringify({
            motivo: motivo,
            monto: monto,
            tipo: tipo,
            categoria: categoria,
            })
        })
        if (!response.ok) {
        throw new Error("Error en la base de datos");
        }
        //agregar funcion acá
        console.log(await response.json());
    }
    catch (err) {
        console.error(err);
        alert("Error al guardar nuevos datos");
    }
}