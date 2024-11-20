const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const sharp = require('sharp');
const { jsPDF } = require('jspdf');
const path = require('path');
const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'archivosrec');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Guardar con el nombre original del archivo
  },
});

// Validación del archivo con Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten archivos de imagen (JPEG o PNG).'), false);
    }
    cb(null, true);
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ruta para manejar el formulario
app.post(
  '/formulario',
  upload.single('archivo'),
  [
    check('nombre').notEmpty().withMessage('El campo "nombre" es obligatorio.'),
    check('apellido').notEmpty().withMessage('El campo "apellido" es obligatorio.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no válido o ausente. Solo se aceptan imágenes JPEG o PNG.' });
    }

    const pdfDirectory = path.join(__dirname, 'archivosgen');
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    }

    const pdfFileName = `${Date.now()}_output.pdf`;
    const outputFilePath = path.join(pdfDirectory, pdfFileName);

    const doc = new jsPDF();
    sharp(req.file.path)
      .resize(500)
      .jpeg({ quality: 80 })
      .toBuffer()
      .then((buffer) => {
        const base64Image = buffer.toString('base64');
        doc.text(`Hello ${req.body.nombre} ${req.body.apellido}`, 10, 10);
        doc.addImage(`data:image/jpeg;base64,${base64Image}`, 'JPEG', 10, 30, 150, 100);
        doc.save(outputFilePath);
        res.sendFile(outputFilePath);
      })
      .catch((err) => {
        console.error('Error al procesar la imagen:', err);
        res.status(500).json({ error: 'Error al procesar la imagen.' });
      });
  }
);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Solo se permiten archivos de imagen (JPEG o PNG).') {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Iniciar el servidor
const PORT = 8083;
app.listen(PORT, () => {
  console.info(`Servidor corriendo en el puerto ${PORT}`);
});
