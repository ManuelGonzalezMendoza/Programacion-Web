const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { jsPDF } = require('jspdf'); // Importación correcta para Node.js

const app = express();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname + '/archivosrec/')); // Carpeta donde guardar la imagen subida
  },
  filename: function (req, file, cb) {
    cb(null, 'archivo_unico'); // Nombre fijo para la imagen subida
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.text());
app.use(upload.single('archivo')); // Procesar archivo con Multer
app.use(cors());

// Ruta para manejar el formulario
app.post('/formulario', (req, res) => {
  const doc = new jsPDF();
  const uploadedFilePath = path.join(__dirname, '/archivosrec/', 'archivo_unico'); // Ruta fija de la imagen

  // Agregar texto al PDF
  doc.text(`Hello ${req.body.nombre}`, 10, 10);

  // Leer el archivo de imagen cargado y convertirlo a Base64
  fs.readFile(uploadedFilePath, (err, data) => {
    if (err) {
      console.error('Error al leer la imagen:', err);
      res.status(500).send('Error al procesar la imagen');
      return;
    }

    // Convertir la imagen a Base64
    const base64Image = Buffer.from(data).toString('base64');
    const imageFormat = 'jpeg'; // Define el formato como fijo (puedes cambiarlo según sea necesario)

    // Agregar la imagen al PDF
    doc.addImage(`data:image/${imageFormat};base64,${base64Image}`, 'JPEG', 10, 20, 100, 100); // Ajusta las coordenadas y el tamaño según sea necesario

    // Guardar el PDF generado con un nombre fijo
    let pdfPath = path.join(__dirname, '/archivosgen/a4.pdf');
    doc.save(pdfPath);

    // Enviar el archivo PDF generado al cliente
    res.sendFile(pdfPath);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
