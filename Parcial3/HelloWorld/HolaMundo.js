const express = require('express');
const app = express();

app.use(express.json());
app.use(express.text());

app.get('/administrativos',(req,res)=>{
    console.log(req.query)
     res.send('Servidores contestando a peticiones a peticion get')
    })

app.get('/maestros',(req,res)=>{
        console.log(req.body)
         res.send('Servidores contestando a peticiones a peticion get')
        })


app.get('/Estudiantes/carrera',(req,res)=>{
console.log(req.params.carrera)
 console.log(req.query.control)
 res.send('Servidores contestando a peticiones a peticion get')
})

app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

app.listen(8082, () => {
    console.log('Servidor Express escuchando en puerto 8082');
});
