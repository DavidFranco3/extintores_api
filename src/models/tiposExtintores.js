const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const tiposExtintores = new Schema({
    nombre: { type: String },
    descripcion: { type: String },
    estado: { type: String }
}, {
    timestamps: true
});

// Middleware `pre` para ajustar las fechas antes de guardar
encuestaInspeccion.pre('save', function(next) {
    // Convertir las fechas a la zona horaria deseada antes de guardarlas
    if (this.createdAt) {
      this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
    }
  
    if (this.updatedAt) {
      this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
    }
  
    next(); // Llama al siguiente middleware o al proceso de guardado
  });

module.exports = mongoose.model("tiposExtintores", tiposExtintores, "tiposExtintores");
