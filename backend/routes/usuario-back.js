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
        const {motivo, monto, tipo, categoria} = req.body;
        if ( !motivo || !monto ) {
            return res.status(400).json({ error: "Completar todos los datos" });
        }

        const regexNumeros = /^[0-9]+(\.\d{1,2})?$/
        if (! regexNumeros.test(monto)){
            return res.status(400).json({ error: "El monto debe contener solo numeros positivos y hasta dos decimales"});
        }

        if (monto <= 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero"});
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria, usuario_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
            [motivo, monto, tipo, categoria, id]);
        res.status(201).json(datosForm.rows[0]);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar la transacción" });
    }
});

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

export default router;