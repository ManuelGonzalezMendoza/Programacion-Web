const express = require("express");
const path = require("path");
const multer = require("multer");
const app = express();

const folder = path.join(__dirname, 'archivos');
const upload = multer({ dest: folder });

app.use(express.json());
app.use(express.text());


app.post("/Formulario", upload.single('archivos'), (req, res) => {
    res.status(200).send("Archivo recibido ");
});


const PORT = 3000;
app.listen(PORT, () => {
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});