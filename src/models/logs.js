const mongoose = require("mongoose");
const moment = require("moment-timezone");
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

// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
logs.methods.formatDates = function() {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
logs.pre('save', function(next) {
    // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
    next();
});

module.exports = mongoose.model("logs", logs, "logs");
