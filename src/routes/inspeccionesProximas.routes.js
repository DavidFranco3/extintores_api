const express = require("express");
const router = express.Router();
const inspeccionesProximas = require("../models/inspeccionesProximas");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const inspeccionesProximasRegistrar = inspeccionesProximas(req.body);
    await inspeccionesProximasRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la inspeccion", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

router.get("/listar", async (req, res) => {
    try {
        const data = await inspeccionesProximas.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo inspecciones activas
            },
            {
                $addFields: {
                    idFrecuenciaObj: {
                        $cond: {
                            if: { $gt: [{ $strLenCP: { $ifNull: ["$idFrecuencia", ""] } }, 0] }, // Verificar si no está vacío
                            then: { $toObjectId: "$idFrecuencia" },
                            else: "$idFrecuencia"
                        }
                    },
                    idEncuestaObj: {
                        $cond: {
                            if: { $gt: [{ $strLenCP: { $ifNull: ["$idEncuesta", ""] } }, 0] }, // Verificar si no está vacío
                            then: { $toObjectId: "$idEncuesta" },
                            else: "$idEncuesta"
                        }
                    },
                    idClienteObj: {
                        $cond: {
                            if: { $gt: [{ $strLenCP: { $ifNull: ["$idCliente", ""] } }, 0] }, // Verificar si no está vacío
                            then: { $toObjectId: "$idCliente" },
                            else: "$idCliente"
                        }
                    }
                }
            },
            {
                $sort: { createdAt: -1 } // Ordenar de más reciente a más antiguo
            },
            {
                $group: {
                    _id: {
                        idFrecuencia: "$idFrecuenciaObj",
                        idEncuesta: "$idEncuestaObj",
                        idCliente: "$idCliente"
                    },
                    doc: { $first: "$$ROOT" } // Obtener el documento más reciente de cada combinación idFrecuencia-idEncuesta
                }
            },
            {
                $replaceRoot: { newRoot: "$doc" } // Extraer el documento dentro de "doc"
            },
            {
                $lookup: {
                    from: "frecuencias",
                    localField: "idFrecuenciaObj",
                    foreignField: "_id",
                    as: "frecuencia"
                }
            },
            {
                $unwind: { path: "$frecuencia", preserveNullAndEmptyArrays: true } // 🔹 Convierte frecuencia de array a objeto
            },
            {
                $lookup: {
                    from: "encuestaInspeccion",
                    localField: "idEncuestaObj",
                    foreignField: "_id",
                    as: "cuestionario"
                }
            },
            {
                $unwind: { path: "$cuestionario", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "clientes",
                    localField: "idClienteObj",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    cantidadDiasNum: { 
                        $toInt: { 
                            $ifNull: ["$frecuencia.cantidadDias", 0] 
                        } 
                    },
                    nuevaInspeccion: {
                        $dateAdd: {
                            startDate: "$createdAt",
                            unit: "day",
                            amount: { 
                                $toInt: { 
                                    $ifNull: ["$frecuencia.cantidadDias", 0] 
                                } 
                            }
                        }
                    }
                }
            },
            {
                $sort: { _id: -1 } // Ordenar el resultado final por _id descendente
            }
        ]);

        res.json(data);
    } catch (error) {
        console.error("Error en /listar:", error);
        res.status(500).json({ message: "Error al obtener las encuestas", error: error.message });
    }
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    inspeccionesProximas
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    inspeccionesProximas
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Inspeccion eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    inspeccionesProximas
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la inspeccion actualizada" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios, firmaCliente } = req.body;

    await inspeccionesProximas
        .updateOne({ _id: id }, { $set: { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios, firmaCliente } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la clasificacion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
