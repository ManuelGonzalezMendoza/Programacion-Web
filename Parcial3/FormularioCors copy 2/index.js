const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp');
const PDFDocument = require('pdfkit'); // Usar PDFKit
const path = require('path');
const express = require('express');
const { check, validationResult } = require('express-validator'); // Importar express-validator
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
    cb(null, 'archivo_unico'); // Guardar con nombre fijo
  },
});

// Validación del archivo con Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter: (req, file, cb) => {
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

// Ruta para manejar el formulario con validaciones
app.post(
  '/formulario',
  upload.single('archivo'),
  [
    check('nombre').notEmpty().withMessage('El campo "nombre" es obligatorio.'),
    check('nombre').isLength({ max: 50 }).withMessage('El nombre no debe exceder los 50 caracteres.'),
    check('apellido').notEmpty().withMessage('El campo "apellido" es obligatorio.'),
    check('apellido').isLength({ max: 50 }).withMessage('El apellido no debe exceder los 50 caracteres.'),
  ],
  (req, res) => {
    // Verificar resultados de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validar si se recibió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    const pdfDirectory = path.join(__dirname, 'archivosgen'); // Carpeta para guardar PDFs
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    }

    const pdfFileName = generarNombreUnico('A4', '.pdf'); // Generar un nombre único para el PDF
    const outputFilePath = path.join(pdfDirectory, pdfFileName);

    // Crear un nuevo documento PDF con PDFKit
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputFilePath);
    doc.pipe(stream); // Escribe el PDF en un archivo

    const uploadedFilePath = req.file.path; // Ruta del archivo subido
    sharp(uploadedFilePath)
      .resize({ width: 500, height: 500, fit: 'inside' }) // Limitar dimensiones máximas
      .jpeg({ quality: 70 }) // Ajustar calidad de la imagen
      .toBuffer()
      .then((buffer) => {
        // Agregar texto al PDF
        doc.fontSize(16).text(`Hello ${req.body.nombre} ${req.body.apellido}`, 100, 100);

        // Agregar la imagen al PDF
        doc.image(buffer, 100, 150, { width: 300 });

        // Finalizar el documento
        doc.end();

        // Enviar el archivo solo después de guardar
        stream.on('finish', () => {
          res.sendFile(outputFilePath);
        });

        stream.on('error', (err) => {
          console.error('Error al escribir el PDF:', err);
          res.status(500).json({ error: 'Error al generar el PDF.' });
        });
      })
      .catch((err) => {
        console.error('Error al procesar la imagen:', err.message, err.stack);
        res.status(500).json({ error: 'Error al procesar la imagen.' });
      });
  }
);

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
const PORT = 8083;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
