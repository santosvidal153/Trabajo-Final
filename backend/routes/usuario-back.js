import express from "express";
import { pool } from "./db.js";

const router = express.Router();

//obtener todas las transacciones (falta identificar usuario)
router.get("/:id/transacciones", async (req,res) => {
    try {
        //falta agregar id de usuario !!!
        const transaccionTotal = await pool.query("SELECT * FROM transacciones ORDER BY fecha DESC");
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
        const {motivo, monto, tipo, categoria, usuarioId} = req.body;
        if ( !motivo || !monto ) {
            return res.status(400).json({ error: "Completar todos los datos" });
        }
        if ( !usuarioId ) {
            return res.status(401).json({ error: "Error al autenticar usuario"});
        }

        const regexNumeros = /^[0-9]+(\.\d{1,2})?$/
        if (! regexNumeros.test(monto)){
            return res.status(400).json({ error: "El monto debe contener solo numeros positivos y hasta dos decimales"});
        }

        if (monto <= 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero"});
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria, usuarioId) VALUES ($1,$2,$3,$4,$5) RETURNING *",
            [motivo, monto, tipo, categoria, usuarioId]);
        res.status(201).json(datosForm.rows[0]);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar la transacción" });
    }
});

export default router;