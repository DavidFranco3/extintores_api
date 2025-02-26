const admin = require("firebase-admin");

// 📌 Ruta al archivo JSON de credenciales (descargar desde Firebase)
const serviceAccount = require("./extintores-4412a-firebase-adminsdk-fbsvc-878eb180f9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
