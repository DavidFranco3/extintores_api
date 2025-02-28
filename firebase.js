const admin = require("firebase-admin");

// 📌 Ruta al archivo JSON de credenciales (descargar desde Firebase)
const serviceAccount = require("./extintores-71c0b-firebase-adminsdk-fbsvc-9fe864c366.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
