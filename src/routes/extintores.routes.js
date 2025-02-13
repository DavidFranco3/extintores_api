const express = require("express");
const router = express.Router();
const extintores = require("../models/extintores");

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
    extintores
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
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
