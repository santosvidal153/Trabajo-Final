import express from "express";
import { pool } from "./db.js";
import simpleAuth from "../autenticacion.js";

const router = express.Router();

//obtener todas las transacciones 
router.get("/", simpleAuth ,async (req,res) => {
    if (!req.usuario_id) {
          return res.status(401).json({ error: "Autenticación requerida" });
        }
    try {
        const usuarioId = req.usuario_id;
        const transaccionTotal = await pool.query("SELECT * FROM transacciones WHERE usuario_id = $1 ORDER BY fecha DESC",
            [usuarioId]);
        res.status(200).json(transaccionTotal.rows);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({error: "Error al buscar transacciones"});
    }
});

//guardar nueva transaccion en db
router.post("/", simpleAuth, async (req,res) => {
    if (!req.usuario_id) {
          return res.status(401).json({ error: "Autenticación requerida" });
        }
    try {
        const id = req.usuario_id;
        const {motivo, monto, tipo, categoria, objetivoId} = req.body;

        if ( !motivo || !monto ) {
            return res.status(400).json({ error: "Completar todos los datos" });
        }

        if ( motivo.length > 60 ) {
            return res.status(400).json({ error: "No puede ingresar mas de 60 caracteres"})
        }

        const regexNumeros = /^[0-9]+(\.\d{1,2})?$/
        if (! regexNumeros.test(monto)){
            return res.status(400).json({ error: "El monto debe contener solo numeros positivos y hasta dos decimales"});
        }

        if ( Number(monto) <= 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero"});
        }

        const stringIngresos = "ingreso"
        const stringGasto = "gasto"
        const stringAhorro = "ahorro"
        const saldoActual = await pool.query("SELECT saldo FROM usuarios WHERE id = $1", [id]);

        const ingresos = await pool.query("SELECT COALESCE(SUM(monto),0) AS ingresos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [id, stringIngresos]);
        const gastos = await pool.query("SELECT COALESCE(SUM(monto),0) AS gastos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [id,stringGasto]);
        const ahorros = await pool.query("SELECT COALESCE(SUM(monto),0) AS ahorros FROM transacciones WHERE usuario_id = $1 AND tipo = $2 AND categoria = $3", [id,stringIngresos,stringAhorro]);

        const saldoDisponible = Number(saldoActual.rows[0].saldo) + Number(ingresos.rows[0].ingresos) - Number(gastos.rows[0].gastos) - Number(ahorros.rows[0].ahorros);

        if ( tipo === stringGasto && Number(monto) > saldoDisponible) {
            return res.status(400).json({ error: "No se puede realizar un gasto mayor al saldo disponible"});
        }
        if ( tipo === stringGasto && categoria === stringAhorro) {
            return res.status(400).json({ error: "Ahorro no puede ser ingresado como gasto"})
        }
        if ( tipo === stringGasto && categoria === 'sueldo') {
            return res.status(400).json({ error: "Sueldo no puede ser ingresado como gasto"})
        }
        if ( tipo === stringIngresos && categoria === 'objetivo') {
            return res.status(400).json({ error: "Objetivo no puede ser ingresado como ingreso"})
        }
        if ( tipo === stringIngresos && categoria === 'alimento') {
            return res.status(400).json({ error: "Alimento no puede ser ingresado como ingreso"})
        }
        if ( tipo === stringIngresos && categoria === 'transporte') {
            return res.status(400).json({ error: "Transporte no puede ser ingresado como ingreso"})
        }
        if ( tipo === stringIngresos && categoria === 'salud') {
            return res.status(400).json({ error: "Salud no puede ser ingresado como ingreso"})
        }
        if ( tipo === stringIngresos && categoria === 'entretenimiento') {
            return res.status(400).json({ error: "Entretenimiento no puede ser ingresado como ingreso"})
        }


        //validaciones para relacion con objetivos
        if (categoria === stringAhorro && objetivoId === "") {
            return res.status(400).json({ error: "Necesitas un objetivo para guardar ahorro"})
        }
        if (objetivoId) {
            const objetivo = await pool.query("SELECT monto, actual FROM objetivos WHERE id = $1 AND usuario_id = $2", [objetivoId, id]);
            if (objetivo.rows.length === 0) {
                return res.status(400).json({ error: "Objetivo inválido" });
            }
            const monto_obj = Number(objetivo.rows[0].monto);
            const monto_act = Number(objetivo.rows[0].actual);
            if ( objetivoId && (monto_act + Number(monto)) > monto_obj ) {
                return res.status(400).json({ error: "El ingreso no puede ser mayor al monto total del objetivo"})
            }
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria, usuario_id, objetivo_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [motivo, monto, tipo, categoria, id, objetivoId]);

        if ( categoria === "ahorro" && objetivoId ) {
            await pool.query("UPDATE objetivos SET actual = actual + $1 WHERE id = $2 AND usuario_id = $3", [monto, objetivoId, id])
        }
        res.status(201).json(datosForm.rows[0]);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar la transacción" });
    }
});

//modificar transacciones
router.put("/:transaccionId", simpleAuth, async (req, res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    const id = req.usuario_id;
    const {transaccionId} = req.params; 
    const { motivo, monto, tipo, categoria } = req.body;
    try {
        if ( !motivo || !monto ) {
            return res.status(400).json({ error: "No pueden haber campos vacios"});
        }
        if ( motivo.length > 60 ) {
            return res.status(400).json({ error: "No puede ingresar mas de 60 caracteres"})
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
        const saldoActual = await pool.query("SELECT saldo FROM usuarios WHERE id = $1", [id]);

        const ingresos = await pool.query("SELECT COALESCE(SUM(monto),0) AS ingresos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [id, stringIngresos]);
        const gastos = await pool.query("SELECT COALESCE(SUM(monto),0) AS gastos FROM transacciones WHERE usuario_id = $1 AND tipo = $2", [id,stringGasto]);
        const ahorros = await pool.query("SELECT COALESCE(SUM(monto),0) AS ahorros FROM transacciones WHERE usuario_id = $1 AND tipo = $2 AND categoria = $3", [id,stringIngresos,stringAhorro]);

        //no cuento ahorro como saldo disponible, falta ver como queda
        const saldoDisponible = Number(saldoActual.rows[0].saldo) + Number(ingresos.rows[0].ingresos) - Number(gastos.rows[0].gastos) - Number(ahorros.rows[0].ahorros);

        if ( tipo === stringGasto && Number(monto) > saldoDisponible) {
            return res.status(400).json({ error: "No se puede realizar un gasto mayor al saldo disponible"});
        }
        if ( tipo === stringGasto && categoria === stringAhorro) {
            return res.status(400).json({ error: "Ahorro no puede ser ingresado como gasto"})
        }
        const transOriginal = await pool.query("SELECT categoria FROM transacciones WHERE id = $1 AND usuario_id = $2", [transaccionId,id]);
        if ( transOriginal.rows[0].categoria === stringAhorro) {
            return res.status(400).json({ error: "No se puede modificar un ahorro"})
        } 
        if ( categoria === stringAhorro ){
            return res.status(400).json({error: "No se puede modificar una transaccion a ahorro"})
        }


        const result = await pool.query("UPDATE transacciones SET motivo = $1, monto = $2, tipo = $3, categoria = $4 WHERE id = $5 AND usuario_id = $6 RETURNING *", 
            [motivo, monto, tipo, categoria, transaccionId, id]);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al modificar transaccion" });
    }
})

//eliminar transacciones
router.delete("/:transaccionId", simpleAuth, async (req,res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    const id = req.usuario_id;
    const {transaccionId} = req.params;
    try {
        const transaccion = await pool.query("SELECT categoria FROM transacciones WHERE id = $1 AND usuario_id = $2", [transaccionId,id]);
        if ( transaccion.rows[0].categoria === "ahorro"){
            return res.status(400).json({ error: "No se puede eliminar un ingreso de ahorro"});
        }
        await pool.query("DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2", [transaccionId,id]);
        res.status(204).end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar transaccion" });
    }
});

//obtener objetivos para ahorro
router.get("/objetivoAhorro", simpleAuth, async (req,res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    try {
        const id = req.usuario_id;
        const result = await pool.query("SELECT id, nombre FROM objetivos WHERE usuario_id = $1 AND estado = 'progreso'", [id]);
        res.status(200).json(result.rows);
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({error: "Error al conseguir datos"});
    }
})

export default router;