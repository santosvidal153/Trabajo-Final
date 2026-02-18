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
let transTemporal = ""
formTransaccion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const motivo = document.querySelector("#motivo").value;
    const monto = document.querySelector("#monto").value;
    const tipo = document.querySelector("#tipo").value;
    const categoria = document.querySelector("#categoria").value;

    transTemporal = {motivo,monto,tipo,categoria};

    //pruebo
    if (categoria === "ahorro" && tipo !== "gasto") {
        const modalAhorro = document.querySelector("#modal-ahorro");
        await abrirModalAhorro();
        document.querySelector("#modal-transaccion").classList.remove("is-active")
        modalAhorro.classList.add("is-active");
        return;
    }
    //
    await guardarTransaccion(transTemporal)
});


const formAhorro = document.querySelector("#form-ahorro");
formAhorro.addEventListener("submit", async (e)=> {
    e.preventDefault();
    let objetivoId = document.querySelector("#objetivo-ahorro").value;
    const transaccion = {...transTemporal, objetivoId}
    await guardarTransaccion(transaccion);
    document.querySelector("#modal-ahorro").classList.remove("is-active");
})


const guardarTransaccion = async(datos) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }   
    try {
        const url = `http://localhost:3000/transacciones`
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-token": token
            },  
        body: JSON.stringify(datos)
        })

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

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
}

//funcion para que no se borren los datos al cambiar de pagina

document.addEventListener("DOMContentLoaded", () => {
    const mostrarTransacciones = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No autenticado. Por favor, inicia sesión nuevamente.');
            return;
        }   
        try {
            const url = `http://localhost:3000/transacciones`
            const response = await fetch(url, {
                headers: {
                    "x-token": token
                }});

            if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
            }

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
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }   
    try {
        const url = `http://localhost:3000/transacciones/${transaccionId}`
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "x-token": token
            }});

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "Error en la base de datos");
            return;
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
    const datoCategoria = nuevoDato.insertCell();
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
    datoCategoria.textContent = transaccion.categoria;

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


const guardarCambios = async (transaccionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }   

    const motivo = document.querySelector("#new-motivo").value;
    const monto = document.querySelector("#new-monto").value;
    const tipo = document.querySelector("#new-tipo").value;
    const categoria = document.querySelector("#new-categoria").value;

    try {
        const response = await fetch(`http://localhost:3000/transacciones/${transaccionId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-token": token
             },
            body: JSON.stringify({
            motivo: motivo,
            monto: monto,
            tipo: tipo,
            categoria: categoria,
            })
        })

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

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
    columna[4].textContent = transaccion.categoria;
}

//abrir modal de ahorro 
const abrirModalAhorro = async() => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    }   
    try {
        const response = await fetch(`http://localhost:3000/transacciones/objetivoAhorro`, {
            headers:{
                "x-token": token
            }},) 
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            const data = await response.json()
            alert(data.error || "Error en la base de datos");
            return;
        }

        const objetivos = await response.json();
        const espOpciones = document.querySelector("#objetivo-ahorro");
        espOpciones.innerHTML = `<option value="">Elija su objetivo</option>`
        objetivos.forEach( objetivo => {
            const opcion = document.createElement("option");
            opcion.value = objetivo.id;
            opcion.textContent = objetivo.nombre;
            espOpciones.appendChild(opcion);
        })
    }
    catch (err) {
    console.error(err);
    alert(err.message); 
    }
}

//botones de form ahorro 
const cancelarAhorro = document.querySelector("#cancelar-ahorro");
cancelarAhorro.addEventListener("click", ()=>{
    document.querySelector("#modal-ahorro").classList.remove("is-active");
})
