const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp'); // Para procesar imágenes
const { jsPDF } = require('jspdf'); // Para generar el PDF

const app = express();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '/archivosrec/');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // Carpeta donde guardar la imagen subida
  },
  filename: function (req, file, cb) {
    cb(null, 'archivo_unico'); // Nombre fijo para la imagen subida
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5 MB
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(upload.single('archivo')); // Procesar archivo con Multer

// Ruta para manejar el formulario
app.post('/formulario', (req, res) => {
  const doc = new jsPDF();
  const uploadedFilePath = path.join(__dirname, '/archivosrec/', 'archivo_unico'); // Ruta fija de la imagen
  const outputFilePath = path.join(__dirname, '/archivosgen/A4.pdf'); // Ruta para guardar el PDF generado

  // Asegurarse de que exista la carpeta para el PDF
  if (!fs.existsSync(path.dirname(outputFilePath))) {
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  }

  // Redimensionar y comprimir la imagen con sharp
  sharp(uploadedFilePath)
    .resize({ width: 500 }) // Ajusta el ancho máximo (manteniendo proporción)
    .jpeg({ quality: 80 }) // Reducir calidad para ahorrar espacio
    .toBuffer()
    .then((buffer) => {
      // Convertir la imagen a Base64
      const base64Image = buffer.toString('base64');

      // Agregar texto al PDF
      doc.text(`Hello ${req.body.nombre}`, 10, 10);

      // Agregar la imagen al PDF
      doc.addImage(`data:image/jpeg;base64,${base64Image}`, 'JPEG', 10, 20, 100, 100);

      // Guardar el PDF en el sistema
      doc.save(outputFilePath);

      // Enviar el archivo PDF generado al cliente
      res.sendFile(outputFilePath);
    })
    .catch((err) => {
      console.error('Error al procesar la imagen:', err);
      res.status(500).send('Error al procesar la imagen');
    });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
