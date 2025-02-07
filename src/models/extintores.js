const mongoose = require("mongoose");
const { Schema } = mongoose;

// modelo de la coleccion usuarios
const extintores = new Schema({
    numeroSerie: { type: String },
    idTipoExtintor: { type: String },
    capacidad: { type: String },
    ultimaRecarga: { type: String },
    ubicacion: { type: String },
    estado: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model("extintores", extintores, "extintores");
