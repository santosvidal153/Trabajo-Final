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
        console.error;
        alert(err.message);
    }
}

const resumenMensual = async () => {
    try {
        const url =  `http://localhost:3000/usuario/${usuarioId}/inicio`
        const response = await fetch(url);
        const data = await response.json();

        const ingresos = data.filter( item => item.tipo === "ingreso");
        const gastos = data.filter(item => item.tipo === "gasto");
        const ahorros = ingresos.filter( item => item.categoria === "ahorro");

        const ingresoMensual = ingresos.reduce((a,b) => a + Number(b.monto), 0)
        const gastoMensual = gastos.reduce((a,b) => a + Number(b.monto), 0);
        const ahorroMensual = ahorros.reduce((a,b) => a + Number(b.monto), 0);

        const filaIngreso = document.querySelector("#ingreso-mensual");
        filaIngreso.textContent = `$${ingresoMensual}`

        const filaGasto = document.querySelector("#gasto-mensual");
        filaGasto.textContent = `$${gastoMensual}`

        const filaAhorro = document.querySelector("#ahorro-mensual");
        filaAhorro.textContent = `$${ahorroMensual}`

        const saldoMensual = ingresoMensual - gastoMensual - ahorroMensual;
        const filaSaldo = document.querySelector("#saldo-mensual")
        filaSaldo.textContent = `$${saldoMensual}`
    }
    catch (err) {
        console.error;
        alert(err.message);
    }
}


document.addEventListener("DOMContentLoaded", ()=> {
    mostrarBienvenida();
    resumenMensual();
})


