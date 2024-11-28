const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia por tu usuario de MySQL
  password: '', // Si no tienes contraseña, déjalo vacío
  database: 'formulariosql' // Cambia al nombre correcto de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `archivo_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Ruta para buscar un usuario por ID
app.get('/usuario/:id', (req, res) => {
  const id = req.params.id;

  const query = 'SELECT * FROM usuario WHERE ID_USUARIO = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err.message);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
});

// Ruta para manejar el formulario y generar el PDF
app.post('/formulario', upload.single('archivo'), (req, res) => {
  const { idUsuario, nombre, apellido } = req.body;

  if (!nombre || !apellido || !req.file) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios y debe subir un archivo.' });
  }

  // Si se proporciona un ID, no se inserta en la base de datos
  if (idUsuario) {
    const pdfFileName = `usuario_${idUsuario}.pdf`;
    const pdfFilePath = path.join(__dirname, 'uploads', pdfFileName);
    const doc = new PDFDocument();

    // Crear el PDF
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Datos del Usuario', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Nombre: ${nombre}`);
    doc.text(`Apellido: ${apellido}`);
    doc.moveDown();

    // Agregar la imagen al PDF
    const imagePath = req.file.path;
    doc.image(imagePath, { fit: [400, 400], align: 'center', valign: 'center' });

    doc.end();

    // Esperar a que el archivo se complete
    stream.on('finish', () => {
      const pdfUrl = `http://localhost:8083/uploads/${pdfFileName}`;
      res.json({ url: pdfUrl });
    });

    stream.on('error', (err) => {
      console.error('Error al generar el PDF:', err.message);
      res.status(500).json({ error: 'Error al generar el PDF' });
    });
    return;
  }

  // Si no se proporciona un ID, se inserta en la base de datos
  const query = 'INSERT INTO usuario (NOMBRE, APELLIDO) VALUES (?, ?)';
  db.query(query, [nombre, apellido], (err, results) => {
    if (err) {
      console.error('Error al insertar datos:', err.message);
      return res.status(500).json({ error: 'Error al guardar los datos' });
    }

    const pdfFileName = `usuario_${results.insertId}.pdf`;
    const pdfFilePath = path.join(__dirname, 'uploads', pdfFileName);
    const doc = new PDFDocument();

    // Crear el PDF
    const stream = fs.createWriteStream(pdfFilePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Datos del Usuario', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Nombre: ${nombre}`);
    doc.text(`Apellido: ${apellido}`);
    doc.moveDown();

    // Agregar la imagen al PDF
    const imagePath = req.file.path;
    doc.image(imagePath, { fit: [400, 400], align: 'center', valign: 'center' });

    doc.end();

    // Esperar a que el archivo se complete
    stream.on('finish', () => {
      const pdfUrl = `http://localhost:8083/uploads/${pdfFileName}`;
      res.json({ url: pdfUrl });
    });

    stream.on('error', (err) => {
      console.error('Error al generar el PDF:', err.message);
      res.status(500).json({ error: 'Error al generar el PDF' });
    });
  });
});

// Ruta para servir los archivos estáticos generados (carpeta "uploads")
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar el servidor
const PORT = 8083;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
