const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp');
const { jsPDF } = require('jspdf');
const path = require('path');
const express = require('express');
const app = express();

// Función para generar nombres únicos
function generarNombreUnico(prefijo = '', extension = '') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefijo}_${timestamp}_${random}${extension}`;
}

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'archivosrec'); // Carpeta para guardar archivos
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // Guardar en `archivosrec`
  },
  filename: function (req, file, cb) {
    // Siempre guardar con el nombre fijo "archivo_unico"
    cb(null, 'archivo_unico');
  },
});

// Validación del archivo con Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter: (req, file, cb) => {
    // Validar que el archivo sea una imagen
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten archivos de imagen (JPEG o PNG).'));
    }
    cb(null, true);
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Ruta para manejar el formulario
app.post('/formulario', upload.single('archivo'), (req, res) => {
  // Validar si se recibió un archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  // Validar si los campos obligatorios están presentes y no están vacíos
  const { nombre, apellido } = req.body;
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
  }
  if (!apellido || apellido.trim() === '') {
    return res.status(400).json({ error: 'El campo "apellido" es obligatorio.' });
  }

  const pdfDirectory = path.join(__dirname, 'archivosgen'); // Carpeta para guardar PDFs
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
  }

  const pdfFileName = generarNombreUnico('A4', '.pdf'); // Generar un nombre único para el PDF
  const outputFilePath = path.join(pdfDirectory, pdfFileName);

  // Crear el PDF
  const doc = new jsPDF();

  // Procesar la imagen y agregarla al PDF
  const uploadedFilePath = req.file.path; // Ruta del archivo subido
  sharp(uploadedFilePath)
    .resize({ width: 500 }) // Redimensionar la imagen
    .jpeg({ quality: 80 }) // Convertir a formato JPEG
    .toBuffer()
    .then((buffer) => {
      const base64Image = buffer.toString('base64');

      // Agregar texto al PDF con nombre y apellido
      doc.text(`Hello ${nombre} ${apellido}`, 10, 10);

      // Agregar la imagen al PDF
      doc.addImage(`data:image/jpeg;base64,${base64Image}`, 'JPEG', 10, 30, 150, 100);

      // Guardar el PDF en el sistema
      doc.save(outputFilePath);

      // Enviar el PDF al cliente
      res.sendFile(outputFilePath);
    })
    .catch((err) => {
      console.error('Error al procesar la imagen:', err);
      res.status(500).json({ error: 'Error al procesar la imagen.' });
    });
});

// Manejar errores de multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error de archivo: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: `Error: ${err.message}` });
  }
  next();
});

// Iniciar el servidor
const PORT = 8082;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
