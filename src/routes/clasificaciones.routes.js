const express = require("express");
const router = express.Router();
const clasificaciones = require("../models/clasificaciones");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const clasificacionesRegistrar = clasificaciones(req.body);
    await clasificacionesRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la clasificacion", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    clasificaciones
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    clasificaciones
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    clasificaciones
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Clasificacion eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    clasificaciones
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la clasificacion actualizada" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await clasificaciones
        .updateOne({ _id: id }, { $set: { nombre, descripcion } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la clasificacion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
