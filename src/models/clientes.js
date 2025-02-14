const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// Modelo de la colección clientes
const clientes = new Schema(
  {
    nombre: { type: String },
    correo: { type: String },
    telefono: { type: String },
    direccion: {
      calle: { type: String },
      nExterior: { type: String },
      nInterior: { type: String },
      colonia: { type: String },
      estadoDom: { type: String },
      municipio: { type: String },
      cPostal: { type: String },
      referencia: { type: String },
    },
    estado: { type: String },
  },
  {
    timestamps: true, // Esto agrega automáticamente `createdAt` y `updatedAt`
  }
);

// Middleware `pre` para ajustar las fechas antes de guardar
// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
clientes.methods.formatDates = function () {
  this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
  this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
clientes.pre('save', function (next) {
  // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
  next();
});

module.exports = mongoose.model("clientes", clientes, "clientes");
