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
    encuestaInspeccion
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
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
