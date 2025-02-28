const express = require("express");
const router = express.Router();
const extintores = require("../models/extintores");
const { ObjectId } = require("mongoose").Types;

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const extintoresRegistrar = extintores(req.body);
    await extintoresRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso del extintor", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    try {
        const data = await extintores.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo extintores activos
            },
            {
                $addFields: {
                    idTipoExtintorObj: { $toObjectId: "$idTipoExtintor" } // Convertir idTipoExtintor a ObjectId
                }
            },
            {
                $lookup: {
                    from: "tiposExtintores", // Nombre de la colección en la BD
                    localField: "idTipoExtintorObj", // Usamos el campo convertido a ObjectId
                    foreignField: "_id", // Campo en `tiposExtintores`
                    as: "tipoExtintor"
                }
            },
            {
                $unwind: { path: "$tipoExtintor", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los extintores", error });
    }
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    extintores
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    extintores
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Extintor eliminado" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    extintores
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado del extintor actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { numeroSerie, idTipoExtintor, capacidad, ultimaRecarga } = req.body;

    await extintores
        .updateOne({ _id: id }, { $set: { numeroSerie, idTipoExtintor, capacidad, ultimaRecarga } })
        .then((data) => res.status(200).json({ mensaje: "Datos del extintor actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
