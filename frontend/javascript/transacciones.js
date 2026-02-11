//const usuarioId = localStorage.getItem("usuario_id");
const usuarioId = 1;

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
        const url = `http://localhost:3000/usuario/${usuarioId}/transacciones`
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
            usuarioId: usuarioId,
            })
        })

        if (!response.ok) {
            const data = await response.json()
            alert(data.error || "Error en la base de datos");
            return;
        }

        const datosGuardados = await response.json();
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
            const url = `http://localhost:3000/usuario/${usuarioId}/transacciones`
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

//funcion de boton de eliminar 
const eliminarTransferencia = async (transaccionId, fila) => {
    try {
        const url = `http://localhost:3000/usuario/${usuarioId}/transacciones/${transaccionId}`
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
    nuevoDato.dataset.id = transaccion.id;

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

    btnEditar.addEventListener("click", ()=> {
        abrirFormEditar(transaccion);
    })

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "button is-small";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.dataset.id = transaccion.id;
    datoOpciones.appendChild(btnEliminar);
    
    btnEliminar.addEventListener("click", () => {
        eliminarTransferencia(transaccion.id,nuevoDato); 
    })

    espDatos.appendChild(nuevoDato);
}


const guardarCambios = async (id) => {
    const motivo = document.querySelector("#new-motivo").value;
    const monto = document.querySelector("#new-monto").value;
    const tipo = document.querySelector("#new-tipo").value;
    const categoria = document.querySelector("#new-categoria").value;

    try {
        const response = await fetch(`http://localhost:3000/transacciones/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
            motivo: motivo,
            monto: monto,
            tipo: tipo,
            categoria: categoria,
            usuarioId: usuarioId,
            })
        })

        if (!response.ok) {
                const data = await response.json();
                alert(data.error || "Error en la base de datos");
                return;
            }

        const datosEditados = await response.json(); 
        actualizarDatos(datosEditados);
        const modal = document.querySelector("#modal-editar-transaccion")
        modal.classList.remove("is-active");
    }
    catch (err) {
    console.error(err);
    alert(err.message); 
    }
}

//abrir modal de modificar transacciones 
const abrirFormEditar = (transaccion) => {
    const modal = document.querySelector("#modal-editar-transaccion");
    modal.dataset.id = transaccion.id;
    document.querySelector("#new-motivo").value = transaccion.motivo;
    document.querySelector("#new-monto").value = transaccion.monto;
    document.querySelector("#new-tipo").value = transaccion.tipo;
    document.querySelector("#new-categoria").value = transaccion.categoria;
    modal.classList.add("is-active");
} 

//botones y demas del form editar
const modalEditar = document.querySelector("#modal-editar-transaccion");
const formEditar = document.querySelector("#form-editar-transaccion");
const cancelarEditar = document.querySelector("#cancelar-cambios");

cancelarEditar.addEventListener("click", () => {
    modalEditar.classList.remove("is-active");
});

formEditar.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = modalEditar.dataset.id;
    guardarCambios(id);
});

const actualizarDatos = (transaccion) => {
    const fila = document.querySelector(`tr[data-id="${transaccion.id}"]`);
    const columna = fila.querySelectorAll("td");
    columna[1].textContent = transaccion.motivo;
    columna[2].textContent = transaccion.tipo;
    columna[2].className = "";
    if (transaccion.tipo === "ingreso") {
        columna[2].classList.add("tag", "is-success");
    }
    else {
        columna[2].classList.add("tag", "is-danger");
    }
    columna[3].textContent = transaccion.monto;
}