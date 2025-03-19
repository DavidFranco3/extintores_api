const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const usuariosModelo = require("../models/usuarios");
const bcrypt = require("bcrypt");

// Para validar los datos del inicio de sesion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);

    const usuarios = await usuariosModelo.findOne({ email });
    console.log(usuarios)

    if (!usuarios) return res.status(401).json({ mensaje: "Usuario no registrado" });
    if (usuarios.estado === "true") {
        if (usuarios.email !== email) return res.status(401).json({ mensaje: "Usuario Incorrecto" });
        const isMatch = await bcrypt.compare(password, usuarios.password);
        if (!isMatch) {
            return res.status(401).json({ mensaje: "Contraseña Incorrecta" });
        }

        const token = await jwt.sign({ _: usuarios._id }, 'secretkey', {
            expiresIn: 86400
        });

        res.status(200).json({ token });
    } else {
        return res.status(401).json({ mensaje: "Inicio de sesion no autorizado" })
    }

});

module.exports = router;