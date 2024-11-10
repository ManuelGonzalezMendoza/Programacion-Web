const express= require('express');
const app =express();

app.use(express.json())


app.get('/',(req,res)=>{res.send('Hola mundo')})


app.get("/administrativos",(req,res)=>{
    console.log(req.query);
    res.send('Servidor contestando a peticion GET con parametros en el query')
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

const PORT =8082;
app.listen(PORT,()=>{
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});



