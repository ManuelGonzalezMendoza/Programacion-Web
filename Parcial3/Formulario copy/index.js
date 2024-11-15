const express= require('express');
const path=require('path')
const app =express();


app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended:true}))


app.get("/formulario",(req,res)=>{
console.log(req.body);
res.send( `Hola  ${req.body.nombre}` )
})


const PORT =3000;
app.listen(PORT,()=>{
    console.info(`Servidor corriendo en el puerto ${PORT}`);
});