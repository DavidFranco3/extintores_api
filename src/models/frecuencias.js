const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const frecuencias = new Schema({
    nombre: { type: String },
    cantidadDias: { type: String },
    estado: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model("frecuencias", frecuencias, "frecuencias");
