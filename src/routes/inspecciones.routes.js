const express = require("express");
const router = express.Router();
const inspecciones = require("../models/inspecciones");
const PDFDocument = require('pdfkit');

router.get('/generar-pdf/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Convertir el id a ObjectId
        const objectId = new mongoose.Types.ObjectId(id);

        // Consulta con agregación y lookups
        const data = await inspecciones.aggregate([
            {
                $match: { _id: objectId }
            },
            {
                $addFields: {
                    idUsuarioObj: { $toObjectId: "$idUsuario" },
                    idClienteObj: { $toObjectId: "$idCliente" },
                    idEncuestaObj: { $toObjectId: "$idEncuesta" }
                }
            },
            {
                $lookup: {
                    from: "usuarios",
                    localField: "idUsuarioObj",
                    foreignField: "_id",
                    as: "usuario"
                }
            },
            { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "clientes",
                    localField: "idClienteObj",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            { $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "encuestaInspeccion",
                    localField: "idEncuestaObj",
                    foreignField: "_id",
                    as: "cuestionario"
                }
            },
            { $unwind: { path: "$cuestionario", preserveNullAndEmptyArrays: true } }
        ]);

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        const inspeccion = data[0];

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="inspeccion_${id}.pdf"`);

        doc.pipe(res);

        // Título del documento
        doc.fontSize(20).text(`Inspección ID: ${inspeccion._id}`, { align: 'center' });
        doc.moveDown();

        // Información del Usuario
        doc.fontSize(14).text('Información del Usuario:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${inspeccion.usuario.nombre}`);
        doc.text(`Email: ${inspeccion.usuario.email}`);
        doc.moveDown();

        // Información del Cliente
        doc.fontSize(14).text('Información del Cliente:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${inspeccion.cliente.nombre}`);
        doc.text(`Correo: ${inspeccion.cliente.correo}`);
        doc.text(`Teléfono: ${inspeccion.cliente.telefono}`);
        doc.text(`Dirección: ${inspeccion.cliente.direccion.calle}, ${inspeccion.cliente.direccion.nExterior}, ${inspeccion.cliente.direccion.colonia}`);
        doc.moveDown();

        // Información del Cuestionario
        doc.fontSize(14).text('Cuestionario:', { underline: true });
        doc.fontSize(12).text(`Nombre: ${inspeccion.cuestionario.nombre}`);
        doc.moveDown();

        // Preguntas y respuestas
        doc.fontSize(14).text('Respuestas:', { underline: true });
        inspeccion.encuesta.forEach((pregunta, index) => {
            doc.fontSize(12).text(`${index + 1}. ${pregunta.pregunta}`);
            doc.text(`   Respuesta: ${pregunta.respuesta}`);
            doc.moveDown(0.5);
        });

        // Comentarios
        doc.fontSize(14).text('Comentarios:', { underline: true });
        doc.fontSize(12).text(inspeccion.comentarios || 'Sin comentarios');

        // Finalizar el PDF
        doc.end();

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
