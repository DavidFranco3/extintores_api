const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { Schema } = mongoose;

// Modelo de la colección clientes
const clientes = new Schema(
  {
    nombre: { type: String },
    correos: { type: Array, default: [] },
    telefonos: { type: Array, default: [] },
    empresa: { type: String },
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
clientes.pre('save', function(next) {
  // Convertir las fechas a la zona horaria deseada antes de guardarlas
  if (this.createdAt) {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
  }

  if (this.updatedAt) {
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate(); // Ajusta a la zona horaria deseada
  }

  next(); // Llama al siguiente middleware o al proceso de guardado
});

module.exports = mongoose.model("clientes", clientes, "clientes");
