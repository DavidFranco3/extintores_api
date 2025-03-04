const express = require("express");
const router = express.Router();
const datosInspeccion = require("../models/datosInspeccion");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const datosInspeccionRegistrar = datosInspeccion(req.body);
    await datosInspeccionRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la datos de inspeccion", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    datosInspeccion
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    datosInspeccion
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    datosInspeccion
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Datos de inspeccion eliminados" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    datosInspeccion
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de los datos de inspeccion actualizada" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, idFrecuencia, idClasificacion, preguntas } = req.body;

    await datosInspeccion
        .updateOne({ _id: id }, { $set: { nombre, preguntas } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la inspeccion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
