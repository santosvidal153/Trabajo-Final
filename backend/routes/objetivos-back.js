import { Router } from "express";
import { pool } from "./db.js";

export const objetivosRouter = Router();

function getId(req, paramName = 'id') {
  const id = Number.parseInt(req.params[paramName]);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

function getObjetivoId(req) {
  return getId(req, 'id');
}

async function getObjetivoPorId(usuarioId, objetivoId) {
  const { rows } = await pool.query(
    "SELECT * FROM objetivos WHERE id = $1 AND usuario_id = $2",
    [objetivoId, usuarioId]
  );
  return rows[0] || null;
}

//función para actualizar estados (bloqueado, progreso, listo, completado) de objetivos
async function actualizarEstadosDinamicos(usuarioId) {
  try {
    const { rows: completados } = await pool.query(
      "SELECT COUNT(*) as count FROM objetivos WHERE usuario_id = $1 AND estado = 'completado'",
      [usuarioId]
    );
    const cantidadCompletados = parseInt(completados[0].count);

    const { rows: objetivos } = await pool.query(
      "SELECT id, requeridos, estado, actual, monto FROM objetivos WHERE usuario_id = $1",
      [usuarioId]
    );

    for (const obj of objetivos) {
      let nuevoEstado;
      
      if (cantidadCompletados >= obj.requeridos) {
        if (obj.estado === 'completado') {
          nuevoEstado = 'completado';
        } else if (obj.actual >= obj.monto) {
          nuevoEstado = 'listo';
        } else {
          nuevoEstado = 'progreso';
        }
      } else {
        nuevoEstado = 'bloqueado';
      }

      if (obj.estado !== nuevoEstado) {
        await pool.query(
          "UPDATE objetivos SET estado = $1 WHERE id = $2 AND usuario_id = $3",
          [nuevoEstado, obj.id, usuarioId]
        );
      } 
    }
  } catch (error) {
    console.error("Error actualizando estados dinámicos:", error);
  }
}

//GET /api/objetivos
objetivosRouter.get("/", async (req, res) => {
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
  const usuarioId = req.usuario_id;

  try {
    await actualizarEstadosDinamicos(usuarioId);

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

    res.json({
      data: rows.map((objetivo) => ({
        ...objetivo,
        estado_dinamico: {
          estado: objetivo.estado_calculado,
          porcentaje: objetivo.porcentaje,
        },
      })),
    });
  } catch (error) {
    console.error("Error obteniendo objetivos:", error);
    res.sendStatus(500);
  }
});

// GET /api/objetivos/:id 
objetivosRouter.get("/:id", async (req, res) => {
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
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
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
  const usuarioId = req.usuario_id;
  const {
    nombre,
    monto,
    actual = 0,
    categoria,
    descripcion,
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
    const { rows: objetivosCompletados } = await pool.query(
      "SELECT COUNT(*) as completados FROM objetivos WHERE usuario_id = $1 AND estado = 'completado'",
      [usuarioId]
    );
    
    const cantidadCompletados = parseInt(objetivosCompletados[0].completados);
    let estadoInicial = "bloqueado";
    
    // Si el usuario tiene suficientes objetivos completados, el objetivo está disponible
    if (cantidadCompletados >= requeridos) {
      estadoInicial = "progreso";
    }

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

// PATCH /api/objetivos/:id/completar
objetivosRouter.patch("/:id/completar", async (req, res) => {
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
  const usuarioId = req.usuario_id;
  const objetivoId = getObjetivoId(req);

  if (!objetivoId) {
    return res.status(404).json({ message: "Objetivo no encontrado" });
  }

  try {
    const objetivo = await getObjetivoPorId(usuarioId, objetivoId);
    if (!objetivo) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }

    const montoActual = parseFloat(objetivo.actual);
    const montoObjetivo = parseFloat(objetivo.monto);
    
    if (montoActual < montoObjetivo) {
      return res.status(400).json({
        message: "Solo se pueden completar objetivos que tengan el monto completo ahorrado",
        monto_actual: montoActual,
        monto_objetivo: montoObjetivo,
        estado_actual: objetivo.estado
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE objetivos 
      SET estado = 'completado', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND usuario_id = $2 
      RETURNING *
      `,
      [objetivoId, usuarioId]
    );

    res.json({
      message: "Objetivo marcado como comprado",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error al marcar objetivo como comprado:", error);
    res.status(500).json({ message: "Error al marcar objetivo como comprado" });
  }
});

// PUT /api/objetivos/:id
objetivosRouter.put("/:id", async (req, res) => {
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
  const usuarioId = req.usuario_id;
  const objetivoId = getObjetivoId(req);
  const { nombre, descripcion, monto, imagen } = req.body;

  if (!objetivoId) {
    return res.status(404).json({ 
      message: "Objetivo no encontrado" 
    });
  }

  if (monto && monto <= 0) {
    return res.status(400).json({ message: "El monto debe ser mayor a 0" });
  }

  try {
    const objetivoActual = await getObjetivoPorId(usuarioId, objetivoId);
    if (!objetivoActual) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }

    if (monto && monto < Number.parseFloat(objetivoActual.actual)) {
      return res.status(400).json({
        message: `El monto no puede ser menor a lo ya ahorrado ($${objetivoActual.actual})`,
      });
    }

    let nuevoNombre = objetivoActual.nombre;
    if (nombre) {
      nuevoNombre = nombre;
    }

    let nuevaDescripcion = objetivoActual.descripcion;
    if (descripcion !== undefined) {
      nuevaDescripcion = descripcion;
    }

    let nuevoMonto = objetivoActual.monto;
    if (monto) {
      nuevoMonto = monto;
    }

    const { rows } = await pool.query(
      `
      UPDATE objetivos 
      SET 
        nombre = $1,
        descripcion = $2,
        monto = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND usuario_id = $5
      RETURNING *
      `,
      [nuevoNombre, nuevaDescripcion, nuevoMonto, objetivoId, usuarioId]
    );

    res.json({ message: "Objetivo actualizado", data: rows[0] });
  } catch (error) {
    console.error("Error actualizando objetivo:", error);
    res.sendStatus(500);
  }
});

// DELETE /api/objetivos/:id
objetivosRouter.delete("/:id", async (req, res) => {
  if (!req.usuario_id) {
    return res.status(401).json({ message: "Autenticación requerida" });
  }
  const usuarioId = req.usuario_id;
  const objetivoId = getObjetivoId(req);

  if (!objetivoId) {
    return res.status(404).json({ message: "Objetivo no encontrado" });
  }

  try {
    const objetivo = await getObjetivoPorId(usuarioId, objetivoId);
    if (!objetivo) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }

    const montoReembolsar = Number.parseFloat(objetivo.actual) || 0;

    const transaccionesExistentes = await pool.query(
      "SELECT id, motivo, objetivo_id FROM transacciones WHERE objetivo_id = $1 AND usuario_id = $2",
      [objetivoId, usuarioId]
    );
    
    const resultadoTransacciones = await pool.query(
      "DELETE FROM transacciones WHERE objetivo_id = $1 AND usuario_id = $2 RETURNING *",
      [objetivoId, usuarioId]
    );

    await pool.query(
      "DELETE FROM objetivos WHERE id = $1 AND usuario_id = $2",
      [objetivoId, usuarioId]
    );

    if (montoReembolsar > 0) {
      await pool.query(
        "UPDATE usuarios SET saldo = saldo + $1 WHERE id = $2",
        [montoReembolsar, usuarioId]
      );
    }

    let mensaje = "Objetivo eliminado exitosamente";
    if (montoReembolsar > 0) {
      mensaje = `Objetivo eliminado. Se reembolsaron $${montoReembolsar} a tu saldo`;
    }

    res.status(200).json({
      message: mensaje,
      data: { monto_reembolsado: montoReembolsar },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error al eliminar el objetivo" 
    });
  }
});

export default objetivosRouter;