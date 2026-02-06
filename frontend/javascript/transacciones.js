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
        datosNuevos(datosGuardados);
        modal.classList.remove("is-active");
        formTransaccion.reset(); 
    }

    catch (err) {
    console.error(err);
    alert("Error al guardar nuevos datos");
    }
});

//funcion de agregar nueva transaccion 
const datosNuevos = (transaccion) => {
    const espDatos = document.querySelector("#info-transacciones");
    const nuevoDato = document.createElement("tr");

    let tipoClase = ""
    if (transaccion.tipo === "Ingreso") {
        tipoClase = "tag is-success";
    }
    else {
        tipoClase = "tag is-danger";
    }

    datoFecha = nuevoDato.insertCell();
    datoMotivo = nuevoDato.insertCell();
    datoTipo = nuevoDato.insertCell();
    datoMonto = nuevoDato.insertCell();
    datoOpciones = nuevoDato.insertCell();

    datoFecha.textContent = new Date(transaccion.fecha).toLocaleDateString();
    datoMotivo.textContent = transaccion.motivo;
    datoTipo.textContent = transaccion.tipo;
    datoTipo.classList.add(tipoClase);
    datoMonto.textContent = transaccion.monto;

    //agrego botones
    const btnEditar = document.createElement("button");
    btnEditar.className = "button is-small";
    btnEditar.textContent = "Editar";
    btnEditar.dataset.id = transaccion.id;

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "button is-small";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.id = transaccion.id;

    datoOpciones.appendChild(btnEditar);
    datoOpciones.appendChild(btnEliminar);

    espDatos.appendChild(nuevoDato);
}

