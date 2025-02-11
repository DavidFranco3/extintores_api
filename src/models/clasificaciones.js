const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// Modelo de la colección clasificaciones
const clasificaciones = new Schema(
  {
    nombre: { type: String },
    descripcion: { type: String },
    estado: { type: String },
  },
  {
    timestamps: true, // Esto agrega `createdAt` y `updatedAt` automáticamente
  }
);

// Middleware `pre` para ajustar las fechas antes de guardar
clasificaciones.pre('save', function(next) {
  // Convertir las fechas a la zona horaria deseada antes de guardarlas
  if (this.createdAt) {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
  }

  if (this.updatedAt) {
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
  }

  next(); // Llama al siguiente middleware o al proceso de guardado
});

module.exports = mongoose.model("clasificaciones", clasificaciones, "clasificaciones");
