const PDFDocument = require('pdfkit');
const { ObjectId } = require("mongoose").Types;
const inspecciones = require("../models/inspecciones");
const streamBuffers = require('stream-buffers'); // Necesitas esta librería para crear el buffer
const axios = require('axios');
const fs = require('fs');

const obtenerDatosInspeccion = async (id) => {
    try {
        const objectId = new ObjectId(id);

        // Consulta con agregación y lookups
        const data = await inspecciones.aggregate([
            { $match: { _id: objectId } },
            {
                $addFields: {
                    idUsuarioObj: { $toObjectId: "$idUsuario" },
                    idClienteObj: { $toObjectId: "$idCliente" },
                    idEncuestaObj: { $toObjectId: "$idEncuesta" },
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
            {
                $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "clientes",
                    localField: "idClienteObj",
                    foreignField: "_id",
                    as: "cliente"
                }
            },
            {
                $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "encuestaInspeccion",
                    localField: "idEncuestaObj",
                    foreignField: "_id",
                    as: "cuestionario"
                }
            },
            {
                $unwind: { path: "$cuestionario", preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: {
                    "cuestionario.idFrecuenciaObj": { $toObjectId: "$cuestionario.idFrecuencia" },
                    "cuestionario.idClasificacionObj": { $toObjectId: "$cuestionario.idClasificacion" }
                }
            },
            {
                $lookup: {
                    from: "frecuencias",
                    localField: "cuestionario.idFrecuenciaObj",
                    foreignField: "_id",
                    as: "cuestionario.frecuencia"
                }
            },
            {
                $unwind: { path: "$cuestionario.frecuencia", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: "clasificaciones",
                    localField: "cuestionario.idClasificacionObj",
                    foreignField: "_id",
                    as: "cuestionario.clasificacion"
                }
            },
            {
                $unwind: { path: "$cuestionario.clasificacion", preserveNullAndEmptyArrays: true }
            },
        ]);

        return data;

    } catch (error) {
        console.error('Error al obtener los datos de la inspección:', error);
        throw new Error('Error al obtener los datos de la inspección');
    }
};

const descargarImagen = async (url) => {
    console.log(url);
    try {
        url = url.replace('dl=0', 'dl=1');

        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Verificar el tipo de imagen (esto es opcional, solo para asegurarte de que la imagen está bien)
        const buffer = Buffer.from(response.data);
        if (!buffer) {
            throw new Error('Error al obtener el buffer de la imagen.');
        }

        return buffer;
    } catch (error) {
        console.error('Error al descargar la imagen:', error.message);
        throw error;
    }
};


const agregarFirmas = async (firmaClienteUrl, firmaInspectorUrl, startY, doc, margin) => {
    console.log(firmaClienteUrl);
    console.log(firmaInspectorUrl);

    // Definir la altura para las firmas
    const firmaHeight = 60;
    let firmaClienteBuffer = null;
    let firmaInspectorBuffer = null;

    try {
        if (firmaClienteUrl) {
            firmaClienteBuffer = await descargarImagen(firmaClienteUrl);
        }
    } catch (error) {
        console.warn("No se pudo descargar la firma del cliente:", error.message);
    }

    try {
        if (firmaInspectorUrl) {
            firmaInspectorBuffer = await descargarImagen(firmaInspectorUrl);
        }
    } catch (error) {
        console.warn("No se pudo descargar la firma del inspector:", error.message);
    }

    doc.moveDown(2); // Espacio antes de las firmas

    // Siempre mostrar el texto de "Firma del Cliente"
    doc.text('Firma del Cliente:', margin, startY);
    if (firmaClienteBuffer) {
        doc.image(firmaClienteBuffer, margin, startY + 20, { width: 150, height: firmaHeight });
    } else {
        doc.text('(Sin firma)', margin, startY + 30);
    }

    // Siempre mostrar el texto de "Firma del Inspector"
    doc.text('Firma del Inspector:', margin + 200, startY);
    if (firmaInspectorBuffer) {
        doc.image(firmaInspectorBuffer, margin + 200, startY + 20, { width: 150, height: firmaHeight });
    } else {
        doc.text('(Sin firma)', margin + 200, startY + 30);
    }

    startY += firmaHeight + 40; // Dejar espacio después de las firmas

    return startY;
};

const generarPDFInspeccion = async (id, inspeccion, res) => {
    // Crear documento PDF
    const doc = new PDFDocument({
        font: "Courier",
        size: "A4",
        margin: 50,
        bufferPages: true,
    });

    // Crear un buffer de salida
    const bufferStream = new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),   // Tamaño inicial del buffer
        incrementAmount: (10 * 1024)  // Tamaño a incrementar
    });

    doc.pipe(bufferStream); // Redirigir la salida al buffer

    // Aquí va el código del PDF (que ya has hecho en la función original)


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspeccion_${id}.pdf"`);
    doc.pipe(res);

    // Definir márgenes y anchos de columnas
    const margin = 50;
    const totalWidth2 = doc.page.width - 2 * margin; // Restar márgenes izquierdo y derecho
    const colWidths2 = [totalWidth2 * 0.2, totalWidth2 * 0.4, totalWidth2 * 0.4]; // Columnas: fecha, datos, lugar
    const smallColWidths = [totalWidth2 * 0.2, totalWidth2 * 0.4, totalWidth2 * 0.4]; // Visita, contacto, inspector

    // Posición inicial
    let startY2 = doc.y;

    // Función para dibujar una celda con texto
    function drawCell(text, x, y, width, height, fontSize = 10) {
        doc.rect(x, y, width, height).stroke(); // Dibuja el rectángulo
        doc.fontSize(fontSize).text(text, x + 5, y + 5, { width: width - 10, align: 'left' }); // Ajusta el texto dentro de la celda
    }

    // Crear cabeceras (primera fila)
    doc.font('Helvetica-Bold'); // Cambiar a fuente en negrita

    // Fecha, Cliente, Lugar (Cabeceras)
    drawCell('Fecha', margin, startY2, colWidths2[0], 20);
    drawCell('Cliente', margin + colWidths2[0], startY2, colWidths2[1], 20);
    drawCell('Lugar', margin + colWidths2[0] + colWidths2[1], startY2, colWidths2[2], 20);
    startY2 += 20;

    // Crear los datos correspondientes (segunda fila)
    // Función para capitalizar cada palabra correctamente
    function capitalize(str) {
        return str.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }
    doc.font('Helvetica'); // Cambiar a fuente en negrita
    // Construir la dirección
    const direccion = `${inspeccion.cliente.direccion.municipio}, ${inspeccion.cliente.direccion.estadoDom}`;
    // Formatear la fecha como dd/mm/aaaa
    const formattedDate = inspeccion.createdAt.toLocaleDateString('es-MX'); // dd/mm/aaaa en formato local
    drawCell(formattedDate, margin, startY2, colWidths2[0], 20);
    drawCell(inspeccion.cliente.nombre, margin + colWidths2[0], startY2, colWidths2[1], 20);
    drawCell(capitalize(direccion), margin + colWidths2[0] + colWidths2[1], startY2, colWidths2[2], 20);
    startY2 += 20;
    doc.font('Helvetica-Bold'); // Cambiar a fuente en negrita
    // Crear cabeceras (tercera fila)
    drawCell('Frecuencia', margin, startY2, smallColWidths[0], 20);
    drawCell('Contacto', margin + smallColWidths[0], startY2, smallColWidths[1], 20);
    drawCell('Inspector', margin + smallColWidths[0] + smallColWidths[1], startY2, smallColWidths[2], 20);
    startY2 += 20;
    doc.font('Helvetica'); // Cambiar a fuente en negrita
    // Crear los datos correspondientes (cuarta fila)
    drawCell(inspeccion.cuestionario.frecuencia.nombre, margin, startY2, smallColWidths[0], 20);
    drawCell(inspeccion.cliente.correo, margin + smallColWidths[0], startY2, smallColWidths[1], 20);
    drawCell(inspeccion.usuario.nombre, margin + smallColWidths[0] + smallColWidths[1], startY2, smallColWidths[2], 20);
    startY2 += 20;

    // Ancho total del documento menos márgenes
    const totalWidth = doc.page.width - 100; // Restar márgenes izquierdo y derecho (50px cada uno)

    // Espacio antes de la siguiente sección
    doc.moveDown(2);

    const centerX = (doc.page.width - totalWidth) / 2; // Calcular el centro

    doc.font('Helvetica-Bold'); // Fuente en negrita
    // Título del reporte
    doc.fontSize(12.5).text(("REPORTE DE INSPECCIONES A SISTEMA DE PROTECCIÓN CONTRA INCENDIO").toUpperCase(), centerX, doc.y, { align: 'center' });
    doc.moveDown(0.5);

    // Nombre de la encuesta
    doc.fontSize(12.5).text((inspeccion.cuestionario.nombre).toUpperCase(), centerX, doc.y, { align: 'center' });

    // Proporciones de las columnas ajustadas para aprovechar mejor el ancho
    const colWidths = [
        totalWidth * 0.50, // Columna de Pregunta (50%)
        totalWidth * 0.35, // Columna de Observaciones (35%)
        totalWidth * 0.15  // Columna de Respuesta (15%) - Reducida
    ];

    // Dibujar la tabla con los nuevos anchos
    const startX = 50;  // Posición inicial en el eje X
    let startY = doc.y; // Posición inicial en el eje Y

    // Encabezado de la tabla en negrita
    doc.font('Helvetica-Bold'); // Cambiar a fuente en negrita
    doc.rect(startX, startY, colWidths[0], 25).stroke(); // Pregunta
    doc.rect(startX + colWidths[0], startY, colWidths[1], 25).stroke(); // Observaciones
    doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], 25).stroke(); // Respuesta
    doc.fontSize(12).text('Pregunta', startX + 5, startY + 8);
    doc.text('Observaciones', startX + colWidths[0] + 5, startY + 8);
    doc.text('Respuesta', startX + colWidths[0] + colWidths[1] + 5, startY + 8);
    startY += 25;

    // Restablecer la fuente a normal para el contenido
    doc.font('Helvetica'); // Volver a la fuente normal para las filas de la tabla

    // Función para ajustar el texto a la celda
    function splitTextIntoLines(text, maxWidth) {
        const lines = [];
        let currentLine = '';

        // Iterar sobre cada palabra y construir las líneas de texto
        text.split(' ').forEach((word) => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const width = doc.widthOfString(testLine);

            if (width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) {
            lines.push(currentLine); // Agregar la última línea
        }

        return lines;
    }

    // Contenido de la tabla
    inspeccion.encuesta.forEach((pregunta, index) => {
        const preguntaTexto = pregunta.pregunta;
        const observaciones = pregunta.observaciones || 'Sin comentarios';
        const respuesta = pregunta.respuesta.toLowerCase() === 'sí' ? 'Sí' : 'No';

        // Dividir la pregunta en varias líneas si es necesario
        const preguntaLines = splitTextIntoLines(preguntaTexto, colWidths[0] - 10);
        const observacionesLines = splitTextIntoLines(observaciones, colWidths[1] - 10);
        const respuestaLines = splitTextIntoLines(respuesta, colWidths[2] - 10);

        // Calcular la altura de la fila con base en la cantidad de líneas
        const maxLines = Math.max(preguntaLines.length, observacionesLines.length, respuestaLines.length);
        const height = maxLines * 18;  // Aumentar la altura de la fila (ahora 18px por línea)

        // Dibujar las celdas
        doc.rect(startX, startY, colWidths[0], height).stroke(); // Pregunta
        doc.rect(startX + colWidths[0], startY, colWidths[1], height).stroke(); // Observaciones
        doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], height).stroke(); // Respuesta

        // Escribir el contenido
        let lineY = startY + 8;
        preguntaLines.forEach(line => {
            doc.fontSize(10).text(line, startX + 5, lineY, { width: colWidths[0] - 10 });
            lineY += 18;  // Aumentar el espacio entre líneas
        });

        lineY = startY + 8;
        observacionesLines.forEach(line => {
            doc.fontSize(10).text(line, startX + colWidths[0] + 5, lineY, { width: colWidths[1] - 10 });
            lineY += 18;  // Aumentar el espacio entre líneas
        });

        lineY = startY + 8;
        respuestaLines.forEach(line => {
            doc.fontSize(10).text(line, startX + colWidths[0] + colWidths[1] + 5, lineY, { width: colWidths[2] - 10 });
            lineY += 18;  // Aumentar el espacio entre líneas
        });

        startY += height; // Ajustar la posición para la siguiente fila
    });

    // Salto de página si es necesario antes de los comentarios
    if (startY > 700) {
        doc.addPage();
        startY = 50;
    }

    // Comentarios Generales (Sección independiente)
    doc.moveDown(4);
    doc.fontSize(12).text('Comentarios Generales:', centerX, doc.y, { align: 'left' }); // Título de comentarios
    doc.fontSize(12).text(inspeccion.comentarios || 'Sin comentarios', centerX, doc.y, { align: 'left' }); // Comentarios
    doc.moveDown(3);
    const finalY = await agregarFirmas(inspeccion.firmaCliente, inspeccion.usuario.firma, doc.y, doc, margin);

    doc.y = finalY;

    doc.flushPages();
    // Finalizar PDF
    doc.end();

    const totalPages = doc.bufferedPageRange().count; // Obtener total de páginas

    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i); // Seleccionar página
        const pageNumber = `Página ${i + 1} de ${totalPages}`;

        doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('gray')
            .text(pageNumber, doc.page.width / 2 - 30, doc.page.height - 50, {
                align: 'center'
            });
    }

    return new Promise((resolve, reject) => {
        bufferStream.on('finish', () => {
            const pdfBuffer = bufferStream.getContents();
            resolve(pdfBuffer);
        });

        bufferStream.on('error', reject);
    });
};

module.exports = { obtenerDatosInspeccion, generarPDFInspeccion };