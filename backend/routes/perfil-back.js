import { pool } from './db.js';
import express from 'express';
import simpleAuth from '../autenticacion.js';
export const perfilRouter = express.Router();

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/;

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

    if (nombre.length < 3 || nombre.length > 60 || !LETTERS_REGEX.test(nombre)) {
        return res.status(422).json({
            error: "El nombre debe tener entre 3 y 60 caracteres y solo puede contener letras y espacios",
        });
    }

    if (contrasena.length < 8) {
        return res.status(422).json({
            error: "La contraseña debe tener al menos 8 caracteres",
        });
    }

    if (pais && (pais.length < 2 || !LETTERS_REGEX.test(pais))) {
        return res.status(422).json({
            error: "El pais debe tener más de 2 letras",
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
                error: "email ya está en uso",
            });
        }

        return res.sendStatus(500);
    }
}); 

//POST /api/perfil/login
perfilRouter.post("/login", async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        console.log("Error: Campos faltantes");
        return res.status(400).json({
            error: "Todos los campos son requeridos",
        });
    }

    try {
        const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        
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

// GET /api/perfil
perfilRouter.get('/', simpleAuth, async (req, res) => {
    try {
        const usuario_id = req.usuario_id;
        const { rows } = await pool.query(
            `SELECT id, nombre, email, ciudad, pais, created_at, updated_at 
             FROM usuarios WHERE id = $1`, 
            [usuario_id]
        );
        
        if (rows.length !== 1) {
            return res.status(404).json({
                error: "Usuario no encontrado",
            });
        }

        return res.status(200).json({
            data: rows.at(0),
        });
    } catch (error) {
        return res.status(500).json({
            error: "Error al obtener perfil del usuario",
        });
    }
});

// PUT /api/perfil
perfilRouter.put("/", simpleAuth, async (req, res) => {
    const { nombre, ciudad, pais } = req.body;
    const usuario_id = req.usuario_id;

    const queryColumns = [];
    const queryValues = [];
    let valuesCount = 1;

    if (typeof nombre === "string" && nombre.length > 3 && nombre.length < 60) {
        queryColumns.push(`nombre = $${valuesCount}`);
        queryValues.push(nombre);
        valuesCount++;
    }
    
    if (typeof ciudad === "string" && ciudad.length > 0) {
        queryColumns.push(`ciudad = $${valuesCount}`);
        queryValues.push(ciudad);
        valuesCount++;
    }

    if (typeof pais === "string" && pais.length > 0) {
        queryColumns.push(`pais = $${valuesCount}`);
        queryValues.push(pais);
        valuesCount++;
    }

    if (queryColumns.length === 0) {
        return res.status(400).json({
            error: "No se proporcionaron campos válidos para actualizar",
        });
    }

    queryValues.push(usuario_id);

    try {
        await pool.query(
            `UPDATE usuarios SET ${queryColumns.join(", ")}, updated_at = NOW() WHERE id = $${valuesCount}`,
            queryValues
        );

        return res.status(200).json({
            message: "Perfil actualizado correctamente",
        });
    } catch (_) {
        return res.status(500).json({
            error: "No se pudo actualizar el perfil"
        });
    }
});

// DELETE /api/perfil
perfilRouter.delete("/", simpleAuth, async (req, res) => {
    const usuario_id = req.usuario_id;

    try {
        const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [usuario_id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }
        
        return res.status(200).json({
            message: "Cuenta eliminada exitosamente"
        });
    } catch (error) {
        return res.status(500).json({
            error: "No se pudo eliminar la cuenta"
        });
    }
});

export default perfilRouter;