const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const usuarios = new Schema({
    nombre: { type: String },
    email: { type: String },
    password: { type: String },
    tipo: { type: String },
    departamento: { type: String },
    estado: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model("usuarios", usuarios, "usuarios");