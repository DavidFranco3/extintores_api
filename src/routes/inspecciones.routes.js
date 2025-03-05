const express = require("express");
const router = express.Router();
const inspecciones = require("../models/inspecciones");
const nodeMailer = require("nodemailer");
const AdmZip = require("adm-zip");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { obtenerDatosInspeccion, generarPDFInspeccion } = require('../utils/pdfGenerador'); // Importamos la función

// Ruta para generar PDF
router.get('/generar-pdf/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const data = await obtenerDatosInspeccion(id);
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const inspeccion = data[0];

        generarPDFInspeccion(id, inspeccion, res);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
});

router.get('/enviar-pdf/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const data = await obtenerDatosInspeccion(id);
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const inspeccion = data[0];

        // Asegúrate de que generarPDFInspeccion devuelva un Buffer en lugar de enviarlo en la respuesta
        const pdfBuffer = await generarPDFInspeccion(id, inspeccion, res);

        const transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "mxtvmasinfo@gmail.com",
                pass: "edqggruseowfqemc",
            },
        });

        const mailOptions = {
            from: "EXTINTORES <mxtvmasinfo@gmail.com>",
            to: inspeccion.cliente.correo,
            subject: `ENCUESTA DE INSPECCIÓN ${id}`,
            text: `ENCUESTA DE INSPECCIÓN ${id}`,
            html: `<h1>Encuesta de Inspección</h1>
            <p><b>Inspector:</b> ${inspeccion.usuario.nombre}</p>
            <p><b>Cliente:</b> ${inspeccion.cliente.nombre}</p>
            <p><b>Tipo de inspección:</b> ${inspeccion.cuestionario.nombre}</p>`,
            attachments: [
                {
                    filename: `Encuesta_de_Inspección_${id}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ mensaje: "Error al enviar el correo", error: error.message });
            }
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));

            return res.status(200).json({ mensaje: "Correo enviado con éxito" });
        });

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
});

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
    try {
        const data = await inspecciones.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo encuestas activas
            },
            {
                $addFields: {
                    idUsuarioObj: { $toObjectId: "$idUsuario" }, // Convertir idFrecuencia a ObjectId
                    idClienteObj: { $toObjectId: "$idCliente" }, // Convertir idClasificacion a ObjectId
                    idEncuestaObj: { $toObjectId: "$idEncuesta" } // Convertir idClasificacion a ObjectId
                }
            },
            {
                $lookup: {
                    from: "usuarios", // Colección de frecuencias
                    localField: "idUsuarioObj",
                    foreignField: "_id",
                    as: "usuario"
                }
            },
            {
                $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $lookup: {
                    from: "clientes", // Colección de clasificaciones
                    localField: "idClienteObj",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $lookup: {
                    from: "encuestaInspeccion", // Colección de clasificaciones
                    localField: "idEncuestaObj",
                    foreignField: "_id",
                    as: "cuestionario"
                }
            },
            {
                $unwind: { path: "$cuestionario", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las encuestas", error });
    }
});

router.get("/listarDatosEncuesta/:idEncuesta", async (req, res) => {
    const { idEncuesta } = req.params; // Obtenemos el idEncuesta del parámetro

    try {
        // Filtramos las inspecciones por idEncuesta y estado "true"
        const data = await inspecciones
            .find({ estado: "true", idEncuesta: idEncuesta })
            .sort({ _id: -1 });

        // Creamos un arreglo para almacenar las preguntas y su conteo
        let resultados = [];

        // Recorremos cada inspección y cada pregunta dentro de la encuesta
        data.forEach((inspeccion) => {
            inspeccion.encuesta.forEach((pregunta) => {
                // Buscamos si la pregunta ya está en los resultados
                let preguntaExistente = resultados.find(
                    (resultado) => resultado.pregunta === pregunta.pregunta
                );

                if (!preguntaExistente) {
                    // Si no existe, la agregamos al arreglo de resultados
                    resultados.push({
                        pregunta: pregunta.pregunta,
                        si: pregunta.respuesta === "Si" ? 1 : 0,
                        no: pregunta.respuesta === "No" ? 1 : 0,
                    });
                } else {
                    // Si ya existe, simplemente actualizamos los contadores de "si" y "no"
                    if (pregunta.respuesta === "Si") {
                        preguntaExistente.si += 1;
                    } else if (pregunta.respuesta === "No") {
                        preguntaExistente.no += 1;
                    }
                }
            });
        });

        // Respondemos con los resultados formateados
        res.json(resultados);

    } catch (error) {
        res.json({ message: error });
    }
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
    const { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios, firmaCliente } = req.body;

    await inspecciones
        .updateOne({ _id: id }, { $set: { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios, firmaCliente } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la clasificacion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
