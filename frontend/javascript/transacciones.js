const botonCrearTransaccion = document.querySelector("#nueva-transaccion");
const modal = document.querySelector("#modal-transaccion");
const botonCancelar = document.querySelector("#cancelar-form");
const formTransaccion = document.querySelector("#form-transaccion");
const botonGuardar = document.querySelector("#guardar-form");

//control de botones

botonCrearTransaccion.addEventListener("click", (e)=> {
    modal.classList.add("is-active");
})

botonCancelar.addEventListener("click", (e)=> {
    modal.classList.remove("is-active");
    formTransaccion.reset();
})

//control de boton guardar

botonGuardar.addEventListener("click", async (e) => {
    e.preventDefault();

    const motivo = document.querySelector("#motivo").value;
    const monto = document.querySelector("#monto").value;
    const tipo = document.querySelector("#tipo").value;
    const categoria = document.querySelector("#categoria").value;

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

        const datosGuardados = await response.json();

        //falta agregar funcion 
        modal.classList.remove("is-active");
        formTransaccion.reset(); 
    }

    catch (err) {
    console.error(err);
    alert("Error al guardar nuevos datos");
    }
});

