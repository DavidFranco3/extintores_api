const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

require("./src/database");

const file = path.join(__dirname, "favicon.ico");

const notFound = require("./src/middleware/notFound");
const handleErrors = require("./src/middleware/handleErrors");
const { verifyToken } = require("./src/middleware/verifyToken");

// Configuración del servidor
const app = express({
  // Opciones de inicialización según la advertencia de desuso
  // Puedes personalizar estas opciones según sea necesario
  app: express.Router(),
});

Sentry.init({
  dsn: "https://34cda94143a14ff3938078498a0bc8e4@o1301469.ingest.sentry.io/6538433",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Configuracion para desplegar
const PORT = process.env.PORT || 5050;

app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, responseType, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");

  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.get("/", (_req, res) => {
  return res.status(200).json({
    mensaje: "API del proyecto de AGGO FIRE CONSULTANT, Propiedad de ISOTECH MÉXICO",
  });
});

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(favicon(file));
app.use(cors());

// Routes
app.use(require("./src/routes/login.routes"));
app.use("/usuarios/", verifyToken, require("./src/routes/usuarios.routes"));
app.use("/logs/", verifyToken, require("./src/routes/logs.routes"));
app.use("/clasificaciones/", verifyToken, require("./src/routes/clasificaciones.routes"));
app.use("/clientes/", verifyToken, require("./src/routes/clientes.routes"));
app.use("/encuestaInspeccion/", verifyToken, require("./src/routes/encuestaInspeccion.routes"));
app.use("/extintores/", verifyToken, require("./src/routes/extintores.routes"));
app.use("/frecuencias/", verifyToken, require("./src/routes/frecuencias.routes"));
app.use("/inspecciones/", verifyToken, require("./src/routes/inspecciones.routes"));
app.use("/inspeccionesProximas/", verifyToken, require("./src/routes/inspeccionesProximas.routes"));
app.use("/tiposExtintores/", verifyToken, require("./src/routes/tiposExtintores.routes"));
app.use("/tokens/", verifyToken, require("./src/routes/tokens.routes"));
app.use("/notificaciones/", require("./src/routes/notificaciones.routes"));
app.use("/inspeccionAnual/", verifyToken, require("./src/routes/inspeccionAnual.routes"));

app.use(notFound);
app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(express.json({
  // Establecer el tiempo de espera por petición en 30 segundos (30000 milisegundos)
  timeout: 30000
}));

module.exports = app;

