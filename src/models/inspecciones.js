const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;


// modelo de la coleccion usuarios
const inspecciones = new Schema({
  idUsuario: { type: String },
  idCliente: { type: String },
  idEncuesta: { type: String },
  encuesta: { type: Array, default: [] },
  imagenes: { type: Array, default: [] },
  comentarios: { type: String },
  firmaCliente: { type: String },
  estado: { type: String },
}, {
  timestamps: true
});

// Middleware `pre` para ajustar las fechas antes de guardar
// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
inspecciones.methods.formatDates = function () {
  this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
  this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
inspecciones.pre('save', function (next) {
  // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
  next();
});

module.exports = mongoose.model("inspecciones", inspecciones, "inspecciones");
