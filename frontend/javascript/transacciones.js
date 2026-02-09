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

formTransaccion.addEventListener("submit", async (e) => {
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
            const errorData = await response.json();
            alert(errorData.error || "Error en la base de datos");
        }

        const datosGuardados = await response.json();

        //falta agregar funcion 
        datosNuevos(datosGuardados);
        modal.classList.remove("is-active");
        formTransaccion.reset(); 
    }

    catch (err) {
    console.error(err);
    alert(err.message); 
    }
});

//funcion para que no se borren los datos al cambiar de pagina

document.addEventListener("DOMContentLoaded", () => {
    const mostrarTransacciones = async () => {
        try {
            const url = "http://localhost:3000/transacciones"
            const response = await fetch(url);
            const transacciones = await response.json();
            transacciones.forEach(element => {
                datosNuevos(element);
            });
        }
        catch (err) {
        console.error(err);
        alert("Error al traer datos"); 
    }
    }
    mostrarTransacciones();
})

//botones de editar y eliminar 
const eliminarTransferencia = async (id, fila) => {
    try {
        const url = `http://localhost:3000/transacciones/${id}`
        const response = await fetch(url, {
            method: "DELETE",});

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "Error en la base de datos");
        }
        
        fila.remove();
    
    }
    catch (err) {
        console.error(err);
        alert(err.message); 
    }
}


//funcion de agregar nueva transaccion 

const datosNuevos = (transaccion) => {
    const espDatos = document.querySelector("#info-transacciones");
    const nuevoDato = document.createElement("tr");

    const datoFecha = nuevoDato.insertCell();
    const datoMotivo = nuevoDato.insertCell();
    const datoTipo = nuevoDato.insertCell();
    const datoMonto = nuevoDato.insertCell();
    const datoOpciones = nuevoDato.insertCell();

    datoFecha.textContent = new Date(transaccion.fecha).toLocaleDateString();
    datoMotivo.textContent = transaccion.motivo;
    datoTipo.textContent = transaccion.tipo;
    if (transaccion.tipo === "ingreso") {
        datoTipo.classList.add("tag", "is-success");
    }
    else {
      datoTipo.classList.add("tag", "is-danger");
    }

    datoMonto.textContent = transaccion.monto;

    //agrego botones
    const btnEditar = document.createElement("button");
    btnEditar.className = "button is-small";
    btnEditar.textContent = "Editar";
    btnEditar.dataset.id = transaccion.id;
    datoOpciones.appendChild(btnEditar);

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "button is-small";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.id = transaccion.id;
    datoOpciones.appendChild(btnEliminar);
    
    btnEliminar.addEventListener("click", () => {
        console.log("id a eliminar", transaccion.id);
        eliminarTransferencia(transaccion.id,nuevoDato); 
    })

    espDatos.appendChild(nuevoDato);
}
