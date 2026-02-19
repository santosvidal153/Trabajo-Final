const mostrarBienvenida = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    } 
    try {
        const url = `http://localhost:3000/inicio/usuario`
        const response = await fetch(url, {
          headers: {
            "x-token": token
          }});
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
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
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    } 
    try{const response = await fetch(`http://localhost:3000/inicio/saldo`, {
        headers: {
            "x-token": token
        }})
        const data = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

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
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No autenticado. Por favor, inicia sesión nuevamente.');
        return;
    } 
    try {
        const url =  `http://localhost:3000/inicio/resumen`
        const response = await fetch(url, {
            headers: {
              "x-token": token
            }});
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }
        const data = await response.json();
        const saldoUsuario = await obtenerSaldo();

        //filtro valores mensuales
        const ingresos = data.filter( item => item.tipo === "ingreso" && item.categoria !== "ahorro");
        const gastos = data.filter(item => item.tipo === "gasto" && item.categoria !== "objetivo");
        const ahorros = ingresos.filter( item => item.tipo === "ingreso" && item.categoria === "ahorro");
        const gastosObj = data.filter(item => item.tipo === "gasto" && item.categoria === "objetivo");

        //sumo valores mensuales
        const ingresoMensual = ingresos.reduce((a,b) => a + Number(b.monto), 0)
        const gastoMensual = gastos.reduce((a,b) => a + Number(b.monto), 0);
        const ahorroMensual = ahorros.reduce((a,b) => a + Number(b.monto), 0);
        const gastoObjMensual = gastosObj.reduce((a,b) => a + Number(b.monto), 0);

        //resumen mensual
        const filaIngreso = document.querySelector("#ingreso-mensual");
        filaIngreso.textContent = `$${ingresoMensual}`

        const filaGasto = document.querySelector("#gasto-mensual");
        filaGasto.textContent = `$${gastoMensual}`

        const filaAhorro = document.querySelector("#ahorro-mensual");
        filaAhorro.textContent = `$${ahorroMensual}`

        const filaSaldoFijo = document.querySelector("#saldo-fijo");
        filaSaldoFijo.textContent = `$${saldoUsuario}`

        const filaGastoAhorro = document.querySelector("#gasto-ahorro-mensual");
        filaGastoAhorro.textContent = `$${gastoObjMensual}`

        //obtener saldo de usuario y calcular lo demas
        const saldoMensual = saldoUsuario + ingresoMensual - gastoMensual - ahorroMensual - gastoObjMensual;
        const filaSaldo = document.querySelector("#saldo-mensual")

        /*mostrar saldo en rojo si es negativo
        if (saldoMensual < 0) {
            filaSaldo.innerHTML = `<span class="has-text-danger">$${saldoMensual}</span>`;
        } else {
            filaSaldo.innerHTML = `<span>$${saldoMensual}</span>`;
        }*/

        let porcDisp = 0;
        if (ingresoMensual > 0){
            porcDisp = Number((saldoMensual * 100 / (ingresoMensual + saldoUsuario)).toFixed(2));
        }
        const porcentaje = document.querySelector("#nota-porcentaje");

        /*notificacion de abajo
        if (saldoMensual < 0) {
            porcentaje.innerHTML = `
            <article class="message is-danger">
            <div class="message-body">
              ¡Cuidado! Tu saldo es negativo. Revisa tus gastos e ingresos.
            </div>
            </article>` 
        }*/
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
        /*const objetivo = gastos.filter(item => item.tipo === "gasto" && item.categoria === "objetivo");
        const alimento = gastos.filter(item => item.tipo === "gasto" && item.categoria === "alimento");
        const transporte = gastos.filter(item => item.tipo === "gasto" && item.categoria === "transporte");
        const salud = gastos.filter(item => item.tipo === "gasto" && item.categoria === "salud");
        const entretenimiento = gastos.filter(item => item.tipo === "gasto" && item.categoria === "entretenimiento");
        const otros = gastos.filter(item => item.tipo === "gasto" && item.categoria === "otros");*/
        
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


