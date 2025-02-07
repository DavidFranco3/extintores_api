const express = require("express");
const router = express.Router();
const tiposExtintores = require("../models/tiposExtintores");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const tiposExtintoresRegistrar = tiposExtintores(req.body);
    await tiposExtintoresRegistrar
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
    tiposExtintores
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    tiposExtintores
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    tiposExtintores
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Tipo de extintor eliminado" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    tiposExtintores
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado del tipo de extintor actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await tiposExtintores
        .updateOne({ _id: id }, { $set: { nombre, descripcion } })
        .then((data) => res.status(200).json({ mensaje: "Datos del tipo de extintor actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
