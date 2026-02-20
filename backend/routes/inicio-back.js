import express from "express";
import { pool } from "./db.js";
import simpleAuth from "../autenticacion.js";

const router = express.Router();

//obtener nombre de usuario
router.get("/usuario", simpleAuth, async(req,res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    try {
        const id = req.usuario_id;
        const nombre = await pool.query("SELECT nombre FROM usuarios WHERE id = $1", [id]);
        res.status(200).json(nombre.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al conseguir nombre de usuario." });
    }
})

//obtener transacciones mensuales
router.get("/resumen", simpleAuth, async (req,res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    try {
        const id = req.usuario_id;
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
router.get("/saldo", simpleAuth, async(req,res) => {
    if (!req.usuario_id) {
        return res.status(401).json({ error: "Autenticación requerida" });
    }
    try {
        const id = req.usuario_id;
        const result = await pool.query("SELECT saldo FROM usuarios WHERE id = $1", [id]);
        res.status(200).json(result.rows[0]);
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({error: "Error al conseguir datos"});
    }
})


export default router;