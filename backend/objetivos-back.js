import { Router } from "express";
import { pool } from "./server.js";

export const objetivosRouter = Router();

// Esto despues lo cambio para que sea dinamico
async function getSaldo(usuarioId) {
  return 10000000.0;
}

function getId(req, paramName = 'id') {
  const id = Number.parseInt(req.params[paramName]);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

function asignarImagen(categoria) {
   return "https://images.unsplash.com/photo-1615733475255-e5427d8b0f2c?w=500&h=300&fit=crop";
}

async function getObjetivoPorId(usuarioId, objetivoId) {
  const { rows } = await pool.query(
    "SELECT * FROM objetivos WHERE id = $1 AND usuario_id = $2",
    [objetivoId, usuarioId]
  );
  return rows[0] || null;
}

// GET /api/objetivos
objetivosRouter.get("/", async (req, res) => {
  const usuarioId = req.usuario_id;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        o.id,
        o.nombre,
        o.monto,
        o.actual,
        o.estado,
        o.categoria,
        o.descripcion,
        o.imagen,
        o.fecha_limite,
        o.requeridos,
        o.created_at,
        o.updated_at,
        CASE 
          WHEN (SELECT COUNT(*) FROM objetivos WHERE usuario_id = $1 AND estado = 'completado') >= o.requeridos 
            THEN (
              CASE 
                WHEN o.estado = 'completado' THEN 'completado'
                WHEN o.actual >= o.monto THEN 'listo'
                ELSE 'progreso'
              END
            )
          ELSE 'bloqueado'
        END AS estado_calculado,
        ROUND((o.actual / o.monto) * 100) AS porcentaje
      FROM objetivos o 
      WHERE o.usuario_id = $1 
      ORDER BY o.created_at DESC
      `,
      [usuarioId]
    );

    const saldo = await getSaldo(usuarioId);

    res.json({
      data: rows.map((objetivo) => ({
        ...objetivo,
        estado_dinamico: {
          estado: objetivo.estado_calculado,
          porcentaje: objetivo.porcentaje,
        },
      })),
      saldo: saldo,
    });
  } catch (error) {
    console.error("Error obteniendo objetivos:", error);
    res.sendStatus(500);
  }
});

// GET /api/objetivos/:id 
objetivosRouter.get("/:id", async (req, res) => {
  const usuarioId = req.usuario_id;
  const objetivoId = getObjetivoId(req);

  if (!objetivoId) {
    return res.status(400).json({ message: "ID de objetivo inválido" });
  }

  try {
    const objetivo = await getObjetivoPorId(usuarioId, objetivoId);
    if (!objetivo) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }
    res.json({ data: objetivo });
  } catch (error) {
    console.error("Error obteniendo objetivo:", error);
    res.sendStatus(500);
  }
});

// POST /api/objetivos
objetivosRouter.post("/", async (req, res) => {
  const usuarioId = req.usuario_id;
  const {
    nombre,
    monto,
    actual = 0,
    categoria,
    descripcion,
    fecha_limite,
    requeridos = 0,
  } = req.body;

  // Validaciones
  if (!nombre || !monto || !categoria) {
    return res.status(400).json({
      message: "Nombre, monto y categoría son obligatorios",
    });
  }

  if (Number(monto) <= 0) {
    return res.status(400).json({
      message: "El monto debe ser mayor a 0",
    });
  }

  try {
    let estadoInicial = "bloqueado";
    if (requeridos === 0) {
      estadoInicial = "progreso";
    }
    const imagenAsignada = asignarImagen(categoria);

    const { rows } = await pool.query(
      `INSERT INTO objetivos (
        usuario_id, nombre, monto, actual, estado, categoria, 
        descripcion, imagen, requeridos
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        usuarioId,
        nombre,
        monto,
        actual,
        estadoInicial,
        categoria,
        descripcion,
        imagenAsignada,
        requeridos,
      ]
    );

    res.status(201).json({
      message: "Objetivo creado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error creando objetivo:", error);
    res.status(500).json({ message: "Error al crear objetivo" });
  }
});