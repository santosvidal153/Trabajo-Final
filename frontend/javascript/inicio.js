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
        alert(err.message);
    }
}

const obtenerSaldo = async() => {
    try{const response = await fetch(`http://localhost:3000/usuario/${usuarioId}/saldo`)
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || "Error en la base de datos");
            return;
        }
        const saldo = Number(data.saldo);
        return saldo;
    }
    catch (err) {
        alert(err.message);
        return;
    }
}

const resumenInicio = async () => {
    try {
        const url =  `http://localhost:3000/usuario/${usuarioId}/inicio`
        const response = await fetch(url);
        const data = await response.json();
        const saldoUsuario = await obtenerSaldo();

        const ingresos = data.filter( item => item.tipo === "ingreso");
        const gastos = data.filter(item => item.tipo === "gasto");
        const ahorros = ingresos.filter( item => item.categoria === "ahorro");

        const ingresoMensual = ingresos.reduce((a,b) => a + Number(b.monto), 0)
        const gastoMensual = gastos.reduce((a,b) => a + Number(b.monto), 0);
        const ahorroMensual = ahorros.reduce((a,b) => a + Number(b.monto), 0);

        //resumen mensual
        const filaIngreso = document.querySelector("#ingreso-mensual");
        filaIngreso.textContent = `$${ingresoMensual}`

        const filaGasto = document.querySelector("#gasto-mensual");
        filaGasto.textContent = `$${gastoMensual}`

        const filaAhorro = document.querySelector("#ahorro-mensual");
        filaAhorro.textContent = `$${ahorroMensual}`

        const filaSaldoFijo = document.querySelector("#saldo-fijo");
        filaSaldoFijo.textContent = `$${saldoUsuario}`

        //obtener saldo de usuario y calcular lo demas
        const saldoMensual = saldoUsuario + ingresoMensual - gastoMensual - ahorroMensual;
        const filaSaldo = document.querySelector("#saldo-mensual")
        filaSaldo.textContent = `$${saldoMensual}`

        //falta agregar funcion para guardar saldo mensual en saldo de usuario

        let porcDisp = 0;
        if (ingresoMensual > 0){
            porcDisp = Number((saldoMensual * 100 / (ingresoMensual + saldoUsuario)).toFixed(2));
        }
        const porcentaje = document.querySelector("#nota-porcentaje");

        //notificacion de abajo
        if (porcDisp <= 100 && porcDisp > 60) {
            porcentaje.innerHTML = `
            <article class="message is-success">
            <div class="message-body">
              ¡Excelente! Te queda el ${porcDisp}% de tu ingreso disponible este mes. 
            </div>
            </article>`
        }
        if (porcDisp <= 60 && porcDisp > 30) {
            porcentaje.innerHTML = `
            <article class="message is-warning">
            <div class="message-body">
              ¡Muy bien! Te queda el ${porcDisp}% de tu ingreso disponible este mes. 
            </div>
            </article>`
        }
        if (porcDisp <= 30 && porcDisp > 0) {
            porcentaje.innerHTML = `
            <article class="message is-danger">
            <div class="message-body">
              ¡Cuidado! Te queda el ${porcDisp}% de tu ingreso disponible este mes. 
            </div>
            </article>`
        }

        //gastos por categoria
        const objetivo = gastos.filter(item => item.categoria === "objetivo");
        const alimento = gastos.filter(item => item.categoria === "alimento");
        const transporte = gastos.filter(item => item.categoria === "transporte");
        const salud = gastos.filter(item => item.categoria === "salud");
        const entretenimiento = gastos.filter(item => item.categoria === "entretenimiento");
        const otros = gastos.filter(item => item.categoria === "otros");
        
        const gastoObj = objetivo.reduce((a,b) => a + Number(b.monto), 0);
        const gastoAli = alimento.reduce((a,b) => a + Number(b.monto), 0);
        const gastoTrans = transporte.reduce((a,b) => a + Number(b.monto), 0);
        const gastoSalud = salud.reduce((a,b) => a + Number(b.monto), 0);
        const gastoEntret = entretenimiento.reduce((a,b) => a + Number(b.monto), 0);
        const gastoOtros = otros.reduce((a,b) => a + Number(b.monto), 0);

        const espObj = document.querySelector("#gasto-objetivo");
        const espAli = document.querySelector("#gasto-alimento");
        const espTrans = document.querySelector("#gasto-transporte");
        const espSalud = document.querySelector("#gasto-salud");
        const espEntret = document.querySelector("#gasto-entretenimiento");
        const espOtros = document.querySelector("#gasto-otros");

        espObj.textContent = `$${gastoObj}`
        espAli.textContent = `$${gastoAli}`
        espTrans.textContent = `$${gastoTrans}`
        espSalud.textContent = `$${gastoSalud}`
        espEntret.textContent = `$${gastoEntret}`
        espOtros.textContent = `$${gastoOtros}`
    }
    catch (err) {
        console.error(err);
        alert(err.message);
    }
}


document.addEventListener("DOMContentLoaded", ()=> {
    mostrarBienvenida();
    resumenInicio();
})


