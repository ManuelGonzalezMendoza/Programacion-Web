const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Habilitar CORS
app.use(cors({
  origin: '*',
}));

// Configuración de MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'formulariosql',
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL.');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'archivosrec');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `archivo_unico_${Date.now()}.jpg`); // Generar nombre único
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo: 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Solo se permiten imágenes JPEG o PNG.'));
    }
    cb(null, true);
  },
});

// Ruta para buscar un usuario por ID
app.get('/buscar', (req, res) => {
  const id = req.query.id;
  const query = 'SELECT * FROM usuario WHERE ID_USUARIO = ?';
  connection.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ nombre: results[0].NOMBRE, apellido: results[0].APELLIDO });
  });
});

// Ruta para generar un PDF
app.post('/generar-pdf', upload.single('archivo'), (req, res) => {
  const id = req.body.id;

  const query = 'SELECT * FROM usuario WHERE ID_USUARIO = ?';
  connection.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = results[0];
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(16).text(`ID: ${usuario.ID_USUARIO}`);
    doc.fontSize(16).text(`Nombre: ${usuario.NOMBRE}`);
    doc.fontSize(16).text(`Apellido: ${usuario.APELLIDO}`);
    doc.image(req.file.path, { width: 300, align: 'center' });

    doc.end();
  });
});

// Iniciar el servidor
const PORT = 8083;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
