var crypto = require("crypto");

function generarPassword(password){
    var salt = crypto.randomBytes(32).toString("hex"); // entrega una cadena de 64 caracteres
    var hash = crypto.scryptSync(password,salt,100000,64,'sha512').toString("hex");//entrega el password
return {
    salt,
    hash
}
}
// oaa
function  validarPassword(password, hash, salt){
  var hashValidar = crypto.scryptSync(password,salt,100000,64,'sha512').toString("hex");
  return hashValidar ===  hash;

}

function autorizado(req,res,siguiente){
    // console.log("Usuario Autorizado");
    if(req.session.usuario || req.session.admin){
      siguiente();  
    }else{
        res.redirect("/login");
    } 
}

function admin(req,res,siguiente){
    // console.log("Administrador autorizado");
    if(req.session.admin){
     siguiente();   
    }else{
        if(req.session.usuario){
            res.redirect("/");
        }else{
            res.redirect("/inicio");
        }
    }
       
}

module.exports={
    generarPassword,
    validarPassword,
    autorizado,
    admin
}