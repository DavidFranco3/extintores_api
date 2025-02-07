const express = require("express");
const router = express.Router();
const clientes = require("../models/clientes");

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const clientesRegistrar = clientes(req.body);
    await clientesRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso del cliente", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    clientes
        .find({ estado: "true" })
        .sort({ _id: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    clientes
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    clientes
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Cliente eliminado" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    clientes
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado del cliente actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, correos, telefonos, empresa, direccion } = req.body;

    await clientes
        .updateOne({ _id: id }, { $set: { nombre, correos, telefonos, empresa, direccion } })
        .then((data) => res.status(200).json({ mensaje: "Datos del cliente actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
