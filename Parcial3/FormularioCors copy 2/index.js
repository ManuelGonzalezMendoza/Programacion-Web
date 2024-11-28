const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'formulariosql'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de almacenamiento para archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'archivos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Endpoint para buscar un usuario por ID
app.get('/buscarUsuario/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT * FROM usuario WHERE ID_USUARIO = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err.message);
      return res.status(500).json({ error: 'Error al buscar el usuario.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(results[0]);
  });
});

// Endpoint para generar un PDF con los datos del usuario
app.post('/generarPDF', upload.single('archivo'), (req, res) => {
  const { nombre, apellido } = req.body;

  if (!nombre || !apellido || !req.file) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const pdfPath = path.join(__dirname, 'archivos', `${Date.now()}_usuario.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(16).text(`Nombre: ${nombre}`, 100, 100);
  doc.fontSize(16).text(`Apellido: ${apellido}`, 100, 130);
  doc.image(req.file.path, 100, 160, { width: 200 });

  doc.end();

  doc.on('finish', () => {
    res.download(pdfPath, 'usuario.pdf', (err) => {
      if (err) {
        console.error('Error al descargar el PDF:', err.message);
        res.status(500).json({ error: 'Error al generar el PDF.' });
      }
    });
  });
});

const PORT = 8083;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
