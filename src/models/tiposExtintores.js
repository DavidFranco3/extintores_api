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

// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
tiposExtintores.methods.formatDates = function() {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
tiposExtintores.pre('save', function(next) {
    // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
    next();
});

module.exports = mongoose.model("tiposExtintores", tiposExtintores, "tiposExtintores");
