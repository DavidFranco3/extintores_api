const express = require("express");
const router = express.Router();
const frecuencias = require("../models/frecuencias");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const frecuenciasRegistrar = frecuencias(req.body);
    await frecuenciasRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la frecuencia", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    frecuencias
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    frecuencias
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    frecuencias
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Frecuencia eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    frecuencias
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la frecuencia actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, cantidadDias } = req.body;

    await frecuencias
        .updateOne({ _id: id }, { $set: { nombre, cantidadDias } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la frecuencia actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
