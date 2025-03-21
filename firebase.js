const admin = require("firebase-admin");

const credenciales = {
  "type": "service_account",
  "project_id": "aggoapp",
  "private_key_id": "648c37f69deeaa240dbb9a010dd3b0bb38d0d5cb",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8KIqzdB98MTis\nYzx9lMunx1NR8BY2GMj7wAcsci8nTkIKfrsYbEnLQQhaqqbof3240uAQ1BsC+LOQ\n6/p4FeaASFgRMPLQHT7tYZaA+FhMPJH385OYtpyFMkxlrK5FYS5GxsUx7pKC20Yd\nIglQ4lWCkxrpdyd0QKzeHL1Hj5SY8lohv/Vhx06LmIrasG0wN9DRdWWM97kTvAbg\nrRhHk6lu++j1AbZlCYnTbWTyH5ImJpOTcaZesBVFWG5a8X1LeN3sh6PKgvxjdy7/\neJQ6+5Rlf0b5bVMbBkYi8YYKhVisOA2bYwBUXdOJ7J4SGGp1qMxsrmRXXa4IOsMj\ntJSpWU3DAgMBAAECggEADxq+D6vZvzGAWC5bM8WXF6/jm2dHkS4qLDN9H+9Go8Qf\nfxIvWMWQovVkg0rBvVZGtGiRPiiYxoNKfu7Cm5M+frvP/glM5LIEVDAKUe4dwHj4\nSsxN4+t84yBni53yG3WyrlHUkK6TKlgJ59rMnqacsK+4cFd1Xlq2xdnOxAjdp+1h\nMpPLd14j7I/bdbGYNml4fKejWRksCNte9Iy5lXa52+lIwuhDbh3R3lTf5HKceeH1\nc75galyEHyeivZzU5110mRTTFeiA+tibBlb9MMVOxN+920KRP7DFJIm/L/lwui1f\n7dS54CHeKEtIGIzlAIVUqgEmj3uZ8DnJ3Cs+4rQKQQKBgQDxmDwHcGkV0Zm1Z/WO\nE4qMTxTeAA5HVS//Vb7JQ7GYXOUhSxUqFjKnVzXxxfX7olQl/EZj1HnEUs0OAl6c\n5NuGTUT8i7B6q2EkU6SStdnn4jjGBQqohvZ5yybZDvzqlCBdy4tYc6BOVL5N2X+I\nq29JLTozzbr1TRgM+bj7pZXe4wKBgQDHYKQwWxOcl1w2D10bvfOJma3ZmpvTQei8\nXe+dsGqKyW7F5xafXTsHEfStc5Ic/KwRWIDYU/WsGoGNWCgXbPi6Os5AJeE1HH3j\nZ8CQl4ymnbi4xHvABlzuro7J5m7AiuzP6t2O0y06wAj44ng0TAiAzG5GNYsZ3VtY\n+3VwiDgroQKBgEMEvAJESKJo1n7gK9oRyalKdrtuwIdBNmNaYeZrBOUDP/yQW3ql\nVb/eDXTYOXhoe3deGBixZGX1ojR0q9JSGiOTY8O67GXbDMOLAGhCUgRlWOJ1m5NM\nfSskE866vaZFGQVr5WfQC3QvRetKnnpHNEPUbATa2TYbAMT4sTv9nymJAoGBAK/U\nrdgraidOYTcX45AkvBOc4XIn5MaxuJPu7/QMclmFfdiwjQXsjbMVhcg2RSSlPQZr\nG+4sVVv7YEeL+Id4Rf7O/7gY7/0L7IXRqUSbMqJ6ND9WoKBfvDOO5ERwoTnTCzfu\nNIjR+nB2jTMZXtMYPuN/5ryqWctsqTPXR+H/cDIhAoGAURxHnFVXWJxFl0i3rBqL\nGF1XhBGTbgSkRbtUjRMPWAcYi9XWLjzc1uQ0hQ2TXh527JsE7xuUbqVhTV6xa3xY\n8vkHLt0xbjeDdBYhDpakoV2uiajDzm2mfgGfdT2lpuiT3PyP55zB3vmcGh0KiqFp\nIoEsgh38dUbCFW8gGFt2pYw=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@aggoapp.iam.gserviceaccount.com",
  "client_id": "105254174139339523497",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aggoapp.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

// 📌 Ruta al archivo JSON de credenciales (descargar desde Firebase)
const serviceAccount = require("./src/keys/aggoapp-firebase-adminsdk-fbsvc-648c37f69d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
