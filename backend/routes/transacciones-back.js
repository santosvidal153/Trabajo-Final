import express from "express";
import { pool } from "./db.js";

const router = express.Router();


//modificar transacciones
router.put("/:id", async (req, res) => {
    const id = req.params.id; 
    const { motivo, monto, tipo, categoria, usuarioId } = req.body;
    try {
        if ( !motivo || !monto ) {
            res.status(400). json({ error: "No pueden haber campos vacios"});
        }
        const regexNumeros = /^[0-9]+(\.\d{1,2})?$/
        if (! regexNumeros.test(monto)){
            return res.status(400).json({ error: "Monto no permitido"});
        }

        if ( Number(monto) <= 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero"});
        }

        const stringIngresos = "ingreso"
        const stringGasto = "gasto"
        const stringAhorro = "ahorro"
        const saldoActual = await pool.query("SELECT saldo FROM usuarios WHERE id = $1", [usuarioId]);

        const ingresos = await pool.query("SELECT COALESCE(SUM(monto),0) AS ingresos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [usuarioId, stringIngresos]);
        const gastos = await pool.query("SELECT COALESCE(SUM(monto),0) AS gastos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [usuarioId,stringGasto]);
        const ahorros = await pool.query("SELECT COALESCE(SUM(monto),0) AS ahorros FROM transacciones WHERE usuario_id = $1 AND tipo = $2 AND categoria = $3", [usuarioId,stringIngresos,stringAhorro]);

        //no cuento ahorro como saldo disponible, falta ver como queda
        const saldoDisponible = Number(saldoActual.rows[0].saldo) + Number(ingresos.rows[0].ingresos) - Number(gastos.rows[0].gastos) - Number(ahorros.rows[0].ahorros);
        console.log(saldoDisponible);
        if ( tipo === stringGasto && Number(monto) > saldoDisponible) {
            return res.status(400).json({ error: "No se puede realizar un gasto mayor al saldo disponible"});
        }
        if ( tipo === stringGasto && categoria === stringAhorro) {
            return res.status(400).json({ error: "Ahorro no puede ser ingresado como gasto"})
        }

        const result = await pool.query("UPDATE transacciones SET motivo = $1, monto = $2, tipo = $3, categoria = $4 WHERE id = $5 AND usuario_id = $6 RETURNING *", 
            [motivo, monto, tipo, categoria, id, usuarioId]);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al modificar transaccion" });
    }
})

export default router;