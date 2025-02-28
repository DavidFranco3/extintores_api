const express = require("express");
const router = express.Router();
const tokens = require("../models/tokens");
const { ObjectId } = require("mongoose").Types;

// Registro de usuarios
router.post("/registro", async (req, res) => {
    try {
        const { token } = req.body;
        // Asegúrate de que el token esté en el cuerpo de la solicitud
        if (!token) {
            return res.status(400).json({ message: "Token no proporcionado" });
        }

        // Buscar si el token ya existe en la base de datos
        const tokenExistente = await tokens.findOne({ token: token });

        if (tokenExistente) {
            // Si el token ya existe, responder con un mensaje adecuado
            return res.status(400).json({ message: "El token ya está registrado" });
        }

        // Si el token no existe, crear una nueva entrada en la base de datos
        const tokensRegistrar = new tokens(req.body);
        const data = await tokensRegistrar.save();

        // Responder con éxito
        res.status(200).json({
            mensaje: "Registro exitoso del token",
            datos: data,
        });
    } catch (error) {
        console.error("Error al guardar el token:", error);
        res.status(500).json({ message: "Hubo un error al guardar el token", error });
    }
});


// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    try {
        const data = await tokens.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo tokens activos
            },
            {
                $addFields: {
                    idUsuarioObj: { $toObjectId: "$idUsuario" } // Convertir idTipotoken a ObjectId
                }
            },
            {
                $lookup: {
                    from: "usuarios", // Nombre de la colección en la BD
                    localField: "idUsuarioObj", // Usamos el campo convertido a ObjectId
                    foreignField: "_id", // Campo en `tipostokens`
                    as: "usuario"
                }
            },
            {
                $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los tokens", error });
    }
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    tokens
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    tokens
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "token eliminado" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    tokens
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado del token actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { numeroSerie, idTipotoken, capacidad, ultimaRecarga } = req.body;

    await tokens
        .updateOne({ _id: id }, { $set: { numeroSerie, idTipotoken, capacidad, ultimaRecarga } })
        .then((data) => res.status(200).json({ mensaje: "Datos del token actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
