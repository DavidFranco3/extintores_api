const admin = require("firebase-admin");

// 📌 Ruta al archivo JSON de credenciales (descargar desde Firebase)
const serviceAccount = require("./appextintores-34e9f-firebase-adminsdk-fbsvc-28b36d233d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
