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

// Middleware `pre` para ajustar las fechas antes de guardar
logs.pre('save', function(next) {
    // Convertir las fechas a la zona horaria deseada antes de guardarlas
    if (this.createdAt) {
      this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
    }
  
    if (this.updatedAt) {
      this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
    }
  
    next(); // Llama al siguiente middleware o al proceso de guardado
  });

module.exports = mongoose.model("logs", logs, "logs");
