const mongoose = require("mongoose");
const moment = require("moment-timezone");
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
    timestamps: true // Mongoose se encargará de generar createdAt y updatedAt automáticamente
});

// Middleware `pre` para ajustar las fechas antes de devolverlas (si es necesario)
usuarios.methods.formatDates = function() {
    this.createdAt = moment(this.createdAt).tz('America/Mexico_City').toDate();
    this.updatedAt = moment(this.updatedAt).tz('America/Mexico_City').toDate();
};

// Middleware `pre` para ajustar las fechas antes de guardarlas (si necesitas hacer alguna transformación al momento de guardar)
usuarios.pre('save', function(next) {
    // Si necesitas hacer ajustes antes de guardar, puedes hacerlo aquí
    next();
});

module.exports = mongoose.model("usuarios", usuarios, "usuarios");
