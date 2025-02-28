const express = require("express");
const enviarNotificacion = require("../../notifications");
const router = express.Router();

// 📌 Ruta para enviar notificaciones push
router.post("/enviar", async (req, res) => {
  console.log(req.body);
  const { token, titulo, mensaje } = req.body;

  if (!token || !titulo || !mensaje) {
    return res.status(400).json({ error: "Faltan parámetros requeridos" });
  }

  const resultado = await enviarNotificacion(token, titulo, mensaje);

  if (resultado.success) {
    res.status(200).json({ mensaje: "Notificación enviada", data: resultado.response });
  } else {
    res.status(500).json({ error: "Error al enviar notificación", detalle: resultado.error });
  }
});

module.exports = router;
