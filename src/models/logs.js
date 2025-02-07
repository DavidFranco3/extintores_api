const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const logs = new Schema({
    folio: { type: String },
    usuario: { type: String },
    correo: { type: String },
    dispositivo: { type: String },
    ip: { type: String },
    descripcion: { type: String },
    sucursal: {type: String},
    detalles: {
        mensaje: { type: String },
        datos: { type: Array, default: [] }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("logs", logs, "logs");
