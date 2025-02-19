const express = require("express");
const router = express.Router();
const inspecciones = require("../models/inspecciones");
const nodeMailer = require("nodemailer");
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

//ruta para enviar el pdf por correo
router.get('/enviar-pdf/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const data = await obtenerDatosInspeccion(id);
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const inspeccion = data[0];

        const pdfBuffer = await generarPDFInspeccion(id, inspeccion, res);

        // Enviar correo solo si el registro es exitoso
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
            subject: "ENCUESTA DE INSPECCION " + id,
            text: "ENCUESTA DE INSPECCION " + id,
            html: `<h1>Encuesta de inspeccion</h1>
            <p>
                <b>Inspector:</b> ${inspeccion.usuario.nombre}
            </p>
            <p>
                <b>Cliente:</b> ${inspeccion.cliente.nombre}
            </p>
            <p>
                <b>Tipo de inspeccion:</b> ${inspeccion.cuestionario.nombre}
            </p>
            <p>`,
            attachments: [
                {
                    filename: `"Encuesta de inspeccion"_${id}.pdf`,
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

            // Responder solo después de que el correo se haya enviado con éxito
            return res.status(200).json({ mensaje: "Correo enviado con exito", datos: data });
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
                    idUsuarioObj: { $toObjectId: "$idUsuario" }, // Convertir idUsuario a ObjectId
                    idClienteObj: { $toObjectId: "$idCliente" }, // Convertir idCliente a ObjectId
                    idEncuestaObj: { $toObjectId: "$idEncuesta" }, // Convertir idEncuesta a ObjectId
                }
            },
            {
                $lookup: {
                    from: "usuarios", // Colección de usuarios
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
                    from: "clientes", // Colección de clientes
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
                    from: "encuestaInspeccion", // Colección de encuestas
                    localField: "idEncuestaObj",
                    foreignField: "_id",
                    as: "cuestionario"
                }
            },
            {
                $unwind: { path: "$cuestionario", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $addFields: {
                    "cuestionario.idFrecuenciaObj": { $toObjectId: "$cuestionario.idFrecuencia" }, // Convertir idFrecuencia dentro de cuestionario a ObjectId
                    "cuestionario.idClasificacionObj": { $toObjectId: "$cuestionario.idClasificacion" } // Convertir idClasificacion dentro de cuestionario a ObjectId
                }
            },
            {
                $lookup: {
                    from: "frecuencias", // Colección de frecuencias
                    localField: "cuestionario.idFrecuenciaObj", // Ahora usando el ObjectId de idFrecuencia
                    foreignField: "_id",
                    as: "cuestionario.frecuencia"
                }
            },
            {
                $unwind: { path: "$cuestionario.frecuencia", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $lookup: {
                    from: "clasificaciones", // Colección de clasificaciones
                    localField: "cuestionario.idClasificacionObj", // Ahora usando el ObjectId de idClasificacion
                    foreignField: "_id",
                    as: "cuestionario.clasificacion"
                }
            },
            {
                $unwind: { path: "$cuestionario.clasificacion", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
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
    const { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios } = req.body;

    await inspecciones
        .updateOne({ _id: id }, { $set: { idUsuario, idCliente, idEncuesta, encuesta, imagenes, comentarios } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la clasificacion actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
