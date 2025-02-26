const admin = require("./firebase"); // Importa la configuración de Firebase

// 📌 Función para enviar notificaciones push
const enviarNotificacion = async (token, titulo, mensaje) => {
  const payload = {
    notification: {
      title: titulo,
      body: mensaje,
    },
    token: token, // Token del dispositivo al que se enviará la notificación
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log("✅ Notificación enviada con éxito:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar la notificación:", error);
    return { success: false, error };
  }
};

module.exports = enviarNotificacion;
