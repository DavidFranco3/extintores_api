const express = require("express");
const router = express.Router();
const inspeccionAnual = require("../models/inspeccionAnual");
const { ObjectId } = require("mongoose").Types;
const nodeMailer = require("nodemailer");
const multer = require('multer');

// Configuración de Multer para almacenar el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Registro de usuarios
router.post("/registro", async (req, res) => {
    const inspeccionAnualRegistrar = inspeccionAnual(req.body);
    await inspeccionAnualRegistrar
        .save()
        .then((data) =>
            res.status(200).json(
                {
                    mensaje: "Registro exitoso de la inspeccion anual", datos: data
                }
            ))
        .catch((error) => res.json({ message: error }));
});

// Obtener todos los usuarios
router.get("/listar", async (req, res) => {
    try {
        const data = await inspeccionAnual.aggregate([
            {
                $match: { estado: "true" } // Filtrar solo extintores activos
            },
            {
                $addFields: {
                    idClienteObj: { $toObjectId: "$idCliente" } // Convertir idTipoExtintor a ObjectId
                }
            },
            {
                $lookup: {
                    from: "clientes", // Nombre de la colección en la BD
                    localField: "idClienteObj", // Usamos el campo convertido a ObjectId
                    foreignField: "_id", // Campo en `tiposExtintores`
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los extintores", error });
    }
});

router.post('/enviar-pdf/:id', upload.single('pdf'), async (req, res) => {
    const { id } = req.params;
    try {
        const data = await inspeccionAnual.aggregate([
            {
                $match: {_id: new ObjectId(id), estado: "true" } // Filtrar solo extintores activos
            },
            {
                $addFields: {
                    idClienteObj: { $toObjectId: "$idCliente" } // Convertir idTipoExtintor a ObjectId
                }
            },
            {
                $lookup: {
                    from: "clientes", // Nombre de la colección en la BD
                    localField: "idClienteObj", // Usamos el campo convertido a ObjectId
                    foreignField: "_id", // Campo en `tiposExtintores`
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);

        const pdfFile = req.file;  // El archivo PDF se recibe en req.file

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const inspeccion = data[0];

        if (!pdfFile) {
            return res.status(400).json({ message: 'No se ha recibido el archivo PDF.' });
        }

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
            subject: `GRAFICOS DE INSPECCIÓN ANUAL ${id}`,
            text: `GRAFICOS DE INSPECCIÓN ANUAL ${id}`,
            html: `<h1>Graficos de Inspección anual</h1>
            <p><b>Cliente:</b> ${inspeccion.cliente.nombre}</p>
            <p><b>inspección:</b> ${inspeccion.titulo}</p>`,
            attachments: [
                {
                    filename: `Graficos_de_inspeccion_anual_${id}.pdf`,
                    content: pdfFile.buffer,
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

router.get("/listarPorId/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const data = await inspeccionAnual.aggregate([
            {
                $match: {_id: new ObjectId(id), estado: "true" } // Filtrar solo extintores activos
            },
            {
                $addFields: {
                    idClienteObj: { $toObjectId: "$idCliente" } // Convertir idTipoExtintor a ObjectId
                }
            },
            {
                $lookup: {
                    from: "clientes", // Nombre de la colección en la BD
                    localField: "idClienteObj", // Usamos el campo convertido a ObjectId
                    foreignField: "_id", // Campo en `tiposExtintores`
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } // Asegurar que sea un objeto
            },
            {
                $sort: { _id: -1 } // Ordenar por ID de forma descendente
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los extintores", error });
    }
});

// Obtener un usuario en especifico
router.get("/obtener/:id", async (req, res) => {
    const { id } = req.params;
    //console.log("buscando")
    inspeccionAnual
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Borrar un usuario
router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    inspeccionAnual
        .deleteOne({ _id: id })
        .then((data) => res.status(200).json({ mensaje: "Inspeccion anual eliminada" }))
        .catch((error) => res.json({ message: error }));
});

// Cambiar estado
router.put("/deshabilitar/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    inspeccionAnual
        .updateOne({ _id: id }, { $set: { estado } })
        .then((data) => res.status(200).json({ mensaje: "Estado de la inspeccion anual actualizado" }))
        .catch((error) => res.json({ message: error }));
});

// Actualizar datos de la orden de trabajo
router.put("/actualizar/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, imagen, correo, telefono, direccion } = req.body;

    await inspeccionAnual
        .updateOne({ _id: id }, { $set: { nombre, imagen, correo, telefono, direccion } })
        .then((data) => res.status(200).json({ mensaje: "Datos de la inspeccion anual actualizados" }))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;
