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