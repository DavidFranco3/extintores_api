const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const encuestaInspeccion = new Schema({
    nombre: { type: String },
    idFrecuencia: { type: String },
    idClasificacion: { type: String },
    preguntas: { type: Array, default: [] },
    estado: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model("encuestaInspeccion", encuestaInspeccion, "encuestaInspeccion");
