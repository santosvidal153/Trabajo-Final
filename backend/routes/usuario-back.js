import express from "express";
import { pool } from "./db.js";

const router = express.Router();

//obtener todas las transacciones 
router.get("/:id/transacciones", async (req,res) => {
    try {
        const usuarioId = req.params.id;
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
router.post("/:id/transacciones", async (req,res) => {
    try {
        const id = req.params.id;
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

        //no cuento ahorro como saldo disponible, falta ver como queda
        const saldoDisponible = Number(saldoActual.rows[0].saldo) + Number(ingresos.rows[0].ingresos) - Number(gastos.rows[0].gastos) - Number(ahorros.rows[0].ahorros);

        if ( tipo === stringGasto && Number(monto) > saldoDisponible) {
            return res.status(400).json({ error: "No se puede realizar un gasto mayor al saldo disponible"});
        }
        if ( tipo === stringGasto && categoria === stringAhorro) {
            return res.status(400).json({ error: "Ahorro no puede ser ingresado como gasto"})
        }

        //validaciones para relacion con objetivos
        const objetivo = await pool.query("SELECT monto, actual FROM objetivos WHERE id = $1 AND usuario_id = $2", [objetivoId, id]);
        const monto_obj = Number(objetivo.rows[0].monto);
        const monto_act = Number(objetivo.rows[0].actual);
        const transaccion = await pool.query("SELECT monto FROM transacciones WHERE objetivo_id = $1 AND usuario_id = $2", [objetivoId,usuarioId]);
        const monto_entrante = Number(transaccion.rows[0].monto);
        if ( (monto_act + monto_entrante) > monto_obj ) {
            return res.status(400).json({ error: "El ingreso no puede ser mayor al monto total del objetivo"})
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria, usuario_id, objetivo_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [motivo, monto, tipo, categoria, id, objetivoId]);
        res.status(201).json(datosForm.rows[0]);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar la transacción" });
    }
});

//modificar transacciones
router.put("/:id/transacciones/:transaccionId", async (req, res) => {
    const { id, transaccionId } = req.params; 
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
router.delete("/:id/transacciones/:transaccionId", async (req,res) => {
    const { id, transaccionId} = req.params;
    try {
        await pool.query("DELETE FROM transacciones WHERE id = $1 AND usuario_id = $2", [transaccionId,id]);
        res.status(204).end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar transaccion" });
    }
});

//obtener nombre de usuario
router.get("/:id", async(req,res) => {
    try {
        const id = req.params.id;
        const nombre = await pool.query("SELECT nombre FROM usuarios WHERE id = $1", [id]);
        res.status(200).json(nombre.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al conseguir nombre de usuario." });
    }
})

//obtener transacciones mensuales
router.get("/:id/inicio", async (req,res) => {
    try {
        const id = req.params.id;
        const result = await pool.query(
            `SELECT monto, tipo, categoria FROM transacciones WHERE usuario_id = $1 AND fecha >= date_trunc('month', CURRENT_DATE) AND fecha <  date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'`,
            [id])
        res.status(200).json(result.rows);
        }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error al conseguir datos"});
    }
})

//obtener saldo de usuarios
router.get("/:id/saldo", async(req,res) => {
    try {
        const id = req.params.id;
        const result = await pool.query("SELECT saldo FROM usuarios WHERE id = $1", [id]);
        res.status(200).json(result.rows[0]);
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({error: "Error al conseguir datos"});
    }
})

//obtener objetivos para ahorro
router.get("/:id/objetivoAhorro", async (req,res) => {
    try {
        const id = req.params.id;
        const stringProgreso = "progreso";
        const result = await pool.query("SELECT id, nombre, monto, actual FROM objetivos WHERE usuario_id = $1 AND estado = $2", [id, stringProgreso]);
        res.status(200).json(result.rows);
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({error: "Error al conseguir datos"});
    }
})

export default router;