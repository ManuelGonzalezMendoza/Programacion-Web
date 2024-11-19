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
  limits: { fileSize: 20 * 1024 * 1024 }, // Límite de 20 MB
});

// Middleware
app.use(express.json({ limit: '10mb' })); // Incrementar límite del cuerpo JSON
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Incrementar límite para datos codificados en URL
app.use(cors());
app.use(upload.single('archivo')); // Procesar archivo con Multer

// Ruta para manejar el formulario
app.post('/formulario', (req, res) => {
  if (!req.file) {
    return res.status(400).send('No se recibió ningún archivo.');
  }

  const doc = new jsPDF();
  const uploadedFilePath = path.join(__dirname, '/archivosrec/', 'archivo_unico'); // Ruta fija de la imagen
  const outputFilePath = path.join(__dirname, '/archivosgen/A4.pdf'); // Ruta para guardar el PDF generado

  // Asegurarse de que exista la carpeta para el PDF
  if (!fs.existsSync(path.dirname(outputFilePath))) {
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  }

  // Procesar la imagen con sharp y manejar errores
  sharp(uploadedFilePath)
    .resize({ width: 500 }) // Ajusta el ancho máximo (manteniendo proporción)
    .jpeg({ quality: 80 }) // Reducir calidad para ahorrar espacio
    .toFile(path.join(__dirname, '/archivosrec/processed_image.jpeg')) // Guardar imagen procesada
    .then(() => {
      const processedFilePath = path.join(__dirname, '/archivosrec/processed_image.jpeg');

      // Leer la imagen procesada como base64
      const base64Image = fs.readFileSync(processedFilePath, 'base64');

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
const PORT = 8081;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
