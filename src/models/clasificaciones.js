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

// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
clasificaciones.methods.formatDates = function() {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
clasificaciones.pre('save', function(next) {
    // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
    next();
});

module.exports = mongoose.model("clasificaciones", clasificaciones, "clasificaciones");
