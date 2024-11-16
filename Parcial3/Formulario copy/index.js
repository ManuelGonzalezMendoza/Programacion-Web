const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const jsPDF = require('pdfkit');
const app = express();


// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + '/archivosrec/'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.text());
app.use(upload.single('archivo'));
app.use(cors());

// Ruta para manejar el formulario
app.post('/formulario', (req, res) => {
  const doc = new jsPDF();
  doc.text(`Hello ${req.body.nombre}`, 10, 10);
  
  let arch = path.join(__dirname + '/archivosgen/a4.pdf');
  doc.save(arch);
  
  res.sendFile(arch);
});

const PORT = 8081;
app.listen(PORT, () => {
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});