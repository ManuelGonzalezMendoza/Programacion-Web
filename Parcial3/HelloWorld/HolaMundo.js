const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hola Mundoooooo');
});

app.listen(8082, () => {
    console.log('Servidor Express escuchando en puerto 8082');
});