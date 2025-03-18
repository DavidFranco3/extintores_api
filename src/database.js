const mongoose = require('mongoose');

// Credenciales para conexion local a la BD
const URI = "mongodb://127.0.0.1/extintores";

// Credenciales para conexion a Mongo Atlas
//const URI = "mongodb+srv://tpv-la-nena:74CDFTgpyW5783eh@cluster0.dsbmu.mongodb.net/extintores"; //fija

// const URI = "mongodb+srv://tpv-la-nena:74CDFTgpyW5783eh@cluster0.dsbmu.mongodb.net/exintores"; //pruebas

mongoose.Promise = global.Promise;

mongoose.set('strictQuery', true);

mongoose
  .connect(URI)
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.log("Database connection error: ", err);
  });

process.on("uncaughtException", (err, origin) => {
  console.error("Caught exception: " + err);
  console.error("Exception origin: " + origin);
});

module.exports = mongoose;
