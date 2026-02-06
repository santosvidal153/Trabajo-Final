import express from "express";
import { pool } from "./db.js";

const router = express.Router();

router.post("/", async (req,res) => {
    try {
        const {motivo, monto, tipo, categoria} = req.body;
        if ( !motivo || !monto ) {
            return res.status(400).json({ error: "Completar todos los datos" });
        }

        if (monto < 0) {
            return res.status(400).json({ error: "El monto debe ser mayor a cero"});
        }
    
        const datosForm = await pool.query("INSERT INTO transacciones (motivo, monto, tipo, categoria) VALUES ($1,$2,$3,$4) RETURNING *",
            [motivo, monto, tipo, categoria]);
        res.status(201).json(datosForm.rows);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar la transacción' });
    }
});

router.get("/", async (req,res) => {
    try {
        const transaccionTotal = await pool.query("SELECT * FROM transacciones ODER BY fecha DESC");
        res.status(200).json(Result.rows);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({error: "Error al buscar transacciones"});
    }
});

export default router;