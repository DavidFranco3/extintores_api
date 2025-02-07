const mongoose = require("mongoose");
const { Schema } = mongoose;


// modelo de la coleccion usuarios
const inspecciones = new Schema({
    idUsuario: { type: String },
    encuesta: { type: String, default: [] },
    imagenes: { type: Array, default: [] },
    estado: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model("inspecciones", inspecciones, "inspecciones");
