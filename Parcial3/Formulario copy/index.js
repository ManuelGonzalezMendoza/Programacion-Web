const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const PDFDocument = require('pdfkit'); // Importamos pdfkit
const fs = require('fs'); // Para guardar el archivo en el sistema de archivos

const app = express();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'archivosrec'));
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

// Ruta para manejar el formulario y generar el PDF
app.post('/formulario', (req, res) => {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, 'archivosgen', `a4-${Date.now()}.pdf`);

  // Crear un stream para guardar el PDF
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  // Agregar contenido al PDF
  doc.fontSize(16).text(`Hello ${req.body.nombre}`, 100, 100);
  doc.fontSize(12).text(`Este PDF fue generado usando pdfkit.`, 100, 150);

  // Finalizar el documento
  doc.end();

  // Esperar a que el archivo PDF esté listo antes de enviarlo al cliente
  writeStream.on('finish', () => {
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err.message);
        res.status(500).send("Error al enviar el archivo.");
      } else {
        console.log("Archivo enviado con éxito");
      }
    });
  });
});

const PORT = 8081;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
