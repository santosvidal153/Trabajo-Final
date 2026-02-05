import express from "express";
import { pool } from "./db.js";

const router = express.Router();

router.post("/", async (req,res) => {
    try {
        const {motivo, monto, tipo, categoria} = req.body;
        if ( !motivo || !monto ) {
            return res.status(400).json({ error: 'Completar todos los datos' });
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria) VALUES ($1,$2,$3,$4)"
            [motivo, monto, tipo, categoria]);
        res.status(201).json(datosForm.rows);
    }

    catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la transacción' });
    }
});

export default router;