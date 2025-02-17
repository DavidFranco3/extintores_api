const express = require("express");
const router = express.Router();
const encuestaInspeccion = require("../models/encuestaInspeccion");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const encuestaInspeccionRegistrar = encuestaInspeccion(req.body);
    await encuestaInspeccionRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la encuesta de inspeccion", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    try {
        const data = await encuestaInspeccion.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo encuestas activas
            },
            {
                $addFields: {
                    idFrecuenciaObj: { $toObjectId: "$idFrecuencia" }, // Convertir idFrecuencia a ObjectId
                    idClasificacionObj: { $toObjectId: "$idClasificacion" } // Convertir idClasificacion a ObjectId
                }
            },
            {
                $lookup: {
                    from: "frecuencias", // Colección de frecuencias
                    localField: "idFrecuenciaObj",
                    foreignField: "_id",
                    as: "frecuencia"
                }
            },
            {
                $unwind: { path: "$frecuencia", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $lookup: {
                    from: "clasificaciones", // Colección de clasificaciones
                    localField: "idClasificacionObj",
                    foreignField: "_id",
                    as: "clasificacion"
                }
            },
            {
                $unwind: { path: "$clasificacion", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las encuestas", error });
    }
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    encuestaInspeccion
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    encuestaInspeccion
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Encuesta de inspeccion eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    encuestaInspeccion
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la encuesta de inspeccion actualizada" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, correos, telefonos, empresa, direccion } = req.body;

    await encuestaInspeccion
        .updateOne({ _id: id }, { $set: { nombre, correos, telefonos, empresa, direccion } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la encuesta de inspeccion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
