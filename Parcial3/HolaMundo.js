const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hola Mundo');  // Envía "Hola Mundo" como respuesta
});

app.listen(8082, () => {
  console.log('Servidor Express escuchando en el puerto 8082');
});
