var ruta = require("express").Router();
var {autorizado} = require("../middlewares/password");
var {mostrarUsuarios, nuevoUsuario, login} = require("../bd/usuariosBD");
const Usuario = require("../modelos/usuario");

ruta.get("/", autorizado, async(req, res)=> {
    var usuarios = await mostrarUsuarios();
    res.render("Usuarios/login", {usuarios});
});

ruta.get("/nuevoUsuario", (req, res) => {
    res.render("Usuarios/nuevo");
})

ruta.post("/nuevoUsuario", async (req, res) => {
    if (req.body.admin === undefined) {
        req.body.admin = false; 
    }
    if (req.file) {
        req.body.foto = req.file.filename;
    } else {
        // Asignar un valor predeterminado en caso de que no se proporcione una imagen
        req.body.foto = "perfil.jpg"; // Reemplaza con el nombre que desees
    }

    var error = await nuevoUsuario(req.body);
    res.redirect("/");
});


ruta.get("/login",(req,res)=>{
    res.render("Usuarios/login")
});

ruta.post("/login",async(req,res)=>{
    var user = await login(req.body);

    if(user==undefined){
       res.redirect("/login");
    }else{
       if(user.admin){
          console.log("Administrador");
          //console.log(user);
          req.session.admin=req.body.usuario;
          res.redirect("/inicio/true");
       }else{
          console.log("usuario");
          //console.log(user);
          req.session.usuario=req.body.nombre;
          req.session.id=user.id
          res.redirect("/inicio");
       }
    }
 });

 ruta.get("/inicio",async (req, res) => {
    res.render("inicio/inicio"); 
});

ruta.get("/logout",(req,res)=>{
    req.session=null;
    res.redirect("/login");
 });

module.exports = ruta;