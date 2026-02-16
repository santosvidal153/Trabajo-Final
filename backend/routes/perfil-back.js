import { pool } from './db.js';
import express from 'express';
import simpleAuth from '../autenticacion.js';
export const perfilRouter = express.Router();

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

//POST /api/perfil
perfilRouter.post("/", async (req, res) => {
    const { email, nombre, contrasena, pais } = req.body;

    if (!email || !nombre || !contrasena) {
        return res.status(400).json({
            error: "Todos los campos son requeridos",
        });
    }

    if (email.length > 255 || !EMAIL_REGEX.test(email)) {
        return res.status(422).json({
            error: "El formato del email es inválido",
        });
    }

    if (nombre.length < 3 || nombre.length > 60) {
        return res.status(422).json({
            error: "El nombre debe tener entre 3 y 60 caracteres",
        });
    }

    if (contrasena.length < 8) {
        return res.status(422).json({
            error: "La contraseña debe tener al menos 8 caracteres",
        });
    }

    try {
        const { rowCount } = await pool.query(
            "INSERT INTO usuarios (nombre, email, contrasena, pais) VALUES ($1, $2, $3, $4)",
            [nombre, email, contrasena, pais || null]
        );

        if (rowCount !== 1) {
            return res.status(500).json({
                error: "No se pudo crear la cuenta"
            });
        }

        return res.sendStatus(201);
    } catch (e) {
        if (e instanceof Error && e.code === '23505') {
            return res.status(409).json({
                error: "El usuario o email ya está en uso",
            });
        }

        return res.sendStatus(500);
    }
}); 

//POST /api/perfil/login
perfilRouter.post("/login", async (req, res) => {
    console.log("Datos recibidos en login:", req.body);
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        console.log("Error: Campos faltantes");
        return res.status(400).json({
            error: "Todos los campos son requeridos",
        });
    }

    try {
        const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        console.log("Usuarios encontrados:", rows.length);
        
        if (rows.length !== 1) {
            console.log("Error: Usuario no encontrado");
            return res.status(400).json({
                error: "El email o la contraseña son invalidos"
            });
        }

        const user = rows[0];
        if (user.contrasena !== contrasena) {
            return res.status(400).json({
                error: "El email o la contraseña son invalidos"
            });
        }

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            token: "user-" + user.id,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
        });
    } catch (_) {
        return res.sendStatus(500);
    }
});