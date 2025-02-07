const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const clientes = new Schema({
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
}, {
    timestamps: true
});

module.exports = mongoose.model("clientes", clientes, "clientes");
