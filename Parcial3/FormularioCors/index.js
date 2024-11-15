const express = require("express");
const path = require("path");
const multer = require("multer");
var cors = require('cors')
const app = express();

const folder = path.join(__dirname, 'archivos');
const upload = multer({ dest: folder });

app.use(express.json());
app.use(express.text());
app.use(cors())
app.use(upload.single('archivo'));


app.use(express.urlencoded( { extended : true } ));

app.post("/formulario", upload.single('archivos'), (req, res) => {
    console.log(req.body)
    res.send(`Hola  ${req.body.nombre}`);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});