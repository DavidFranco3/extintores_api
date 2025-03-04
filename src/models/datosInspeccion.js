const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// Modelo de la colección encuestaInspeccion
const datosInspeccion = new Schema(
  {
    nombre: { type: String },
    preguntas: { type: Array, default: [] },
    estado: { type: String },
  },
  {
    timestamps: true, // Esto agrega automáticamente los campos `createdAt` y `updatedAt`
  }
);

// Middleware `pre` para ajustar las fechas antes de guardar
// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
datosInspeccion.methods.formatDates = function() {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
datosInspeccion.pre('save', function(next) {
    // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
    next();
});

module.exports = mongoose.model("datosInspeccion", datosInspeccion, "datosInspeccion");
