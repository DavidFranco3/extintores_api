const express = require("express");
const router = express.Router();
const inspecciones = require("../models/inspecciones");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const inspeccionesRegistrar = inspecciones(req.body);
    await inspeccionesRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la inspeccion", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    inspecciones
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    inspecciones
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    inspecciones
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Inspeccion eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    inspecciones
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la inspeccion actualizada" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    await inspecciones
        .updateOne({ _id: id }, { $set: { nombre, descripcion } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la clasificacion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
