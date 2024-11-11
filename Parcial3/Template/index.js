const express= require('express');
const path=require('path')
const app =express();

const pug= require('pug')

app.use(express.json());
app.use(express.text());

app.set('view engine','pug');
app.set('views',path.join(__dirname, 'vistas'))


app.get('/',(req,res)=>{res.send('Hola mundo')})


app.get("/administrativos",(req,res)=>{
    console.log(req.query);
  
    res.render('admin')
    })

app.get("/maestros",(req,res)=>{
console.log(req.body);
res.send('Servidor contestando a peticion GET con parametros en el body')
})


app.get("/estudiantes/:carrera",(req,res)=>{
    console.log(req.params.carrera);
    console.log(req.params.control);
    res.send('Servidor contestando a peticion GET con parametros')
    })

const PORT =3000;
app.listen(PORT,()=>{
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});