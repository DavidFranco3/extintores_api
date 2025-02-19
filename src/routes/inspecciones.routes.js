const express = require("express");
const router = express.Router();
const inspecciones = require("../models/inspecciones");
const PDFDocument = require('pdfkit'); // Asegúrate de tener instalado pdfkit
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');  // Importar pdfmake para Node.js
const vfsFonts = require('pdfmake/build/vfs_fonts');  // Importar las fuentes VFS

// Agregar las fuentes VFS al pdfMake
  
  // Crear el documento PDF
  router.get('/generar-pdf/:id', (req, res) => {
    const id = req.params.id;

    try {
        // Datos de la tabla
        const datos = [
            ['ID', 'Nombre', 'Edad'],
            [1, 'Juan Pérez', 30],
            [2, 'Ana García', 25],
            [3, 'Luis Rodríguez', 35],
        ];

        // Definición del documento PDF
        const docDefinition = {
            content: [
                {
                    text: `Reporte de Datos - ID: ${id}`,
                    style: 'header',
                    alignment: 'center',
                },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        body: datos,
                    },
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                },
                tableExample: {
                    margin: [0, 5, 0, 15],
                },
            },
        };

        // Crear el documento PDF
        const pdfDoc = pdfMake.createPdf(docDefinition);

        // Guardar el PDF en el servidor (opcional)
        const filePath = path.join(__dirname, 'tabla.pdf');
        pdfDoc.getBuffer((buffer) => {
            // Guardar el buffer como un archivo en el servidor
            fs.writeFileSync(filePath, buffer);

            // Enviar el PDF como respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="tabla.pdf"');
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error al generar el PDF:', error);

        // Enviar un error 500 si algo falla
        res.status(500).json({
            error: 'Hubo un problema al generar el PDF. Intente nuevamente.',
            message: error.message,
        });
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
