const { generarPassword, validarPassword} = require("../middlewares/password");
var Usuario = require("../modelos/usuario");
var fs = require ('fs').promises;
const { conexion} = require("./conexion"); 

async function mostrarUsuarios() {
    var users=[];
    try {
    var usuarios = await conexion.get();
    usuarios.forEach((usuario) => {
        var usuario1 = new Usuario(usuario.id, usuario.data()); 
        if(usuario1.bandera == 0) {
           users.push(usuario1.obtenerUsuario);
        }
    });
    } catch (err) {
       console.log("Error al obtener los usuarios de firebase" + err); 
       users.push(null);
    }
    return users;
}


async function buscarPerfil(id) {
    var usuarios;
    try {
        var usuarioBD = await conexion.doc(id).get();
        
        var usuarioObjeto = new Usuario(usuarioBD.id,usuarioBD.data());
            if (usuarioObjeto.bandera==0) {

            usuarios = usuarioObjeto.obtenerUsuario;

        }
    } catch (err) {
        console.log("Error al buscar el usuario " + err);
        usuarios = null;
    }
    return usuarios;
}

async function buscarPorID(id) {
    var user;
    try {
        var usuarioBD = await conexion.doc(id).get();
        
        var usuarioObjeto = new Usuario(usuarioBD.id,usuarioBD.data());
            if (usuarioObjeto.bandera==0) {
            user = usuarioObjeto.obtenerUsuario;
        }
    } catch (err) {
        console.log("Error al buscar el usuario " + err);
        user = null;
    }
    return user;
}

async function nuevoUsuario(datos) {
    var {salt,hash} = generarPassword(datos.password);
    datos.password = hash;
    datos.salt = salt;
    // datos.admin = false;
    var usuario = new Usuario(null, datos);
    var error = 1;
    if(usuario.bandera == 0) {
        try {
            await conexion.doc().set(usuario.obtenerUsuario);
            console.log("usuario registrado correctamente");
            error = 0;
        } catch (err) {
            console.log("Error al registrar al usuario " + err); 
        }
    }
    return error;
}

async function modificarUsuario(datos) {
    var usuario1 = await buscarPorID(datos.id);
    var error = 1;
    if(usuario1 != undefined){
        if(datos.password ==""){
            datos.password = usuario1.password;
            datos.salt = usuario1.salt;
        }
        else{
           var {salt, hash} = generarPassword(datos.password);
           datos.password = hash;
           datos.salt =salt;
        }
        var fotoRuta = './web/Usuarios/images/' + usuario1.foto;
        await fs.unlink(fotoRuta);
        console.log(datos);
        usuario1.foto = datos.foto;
        usuario1.nombre = datos.nombre;
        usuario1.usuario = datos.usuario;
        if(usuario1.password == ""){
           console.log("No actualizo contraseña");
        }
        usuario1.password = datos.password;
        usuario1.salt = datos.salt;

        var usuario = new Usuario(usuario1.id, usuario1);
        if (usuario.bandera == 0) {
            try {
            // console.log(usuario.obtenerUsuario);
                await conexion.doc(usuario.id).set(usuario.obtenerUsuario);
                console.log("Usuario actualizado correctamente");
                error = 0;
            } catch (err) {
                console.log("Error al modificar el usuario " + err);
            }
        }
        else {
            console.log("Los datos no son correctos");
        }
    }
    return error;
}

async function borrarUsuario(id) {
    var error = 1;
    var user = await buscarPorID(id);
    if(user != undefined){
    try {
        var fotoRuta = './web/Usuarios/images/' + user.foto;
        await fs.unlink(fotoRuta);
        await conexion.doc(id).delete();
        console.log("Usuario borrado");
        error = 0;
    } catch (err) {
        console.log("Error al borrar el usuario" + err);
    }
}
    return error;
}

async function login(datos){
    var user = undefined;
    var usuarioObjeto;
    try{
        var usuarios = await conexion.where('usuario','=',datos.usuario).get();
        if(usuarios.docs.length==0){
            return undefined;
        } 
        usuarios.docs.filter((doc)=>{
            var validar = validarPassword(datos.password,doc.data().password,doc.data().salt);
            if(validar){
                usuarioObjeto = new Usuario(doc.id,doc.data());
                if(usuarioObjeto.bandera==0){
                    user = usuarioObjeto.obtenerUsuario;
                }
            }
            else 
                return undefined;
        });
    }
    catch(err){
        console.log("Error al recuperar al usuario: "+ err);
    }
    return user;
}


module.exports={
    mostrarUsuarios,
    buscarPorID,
    nuevoUsuario,
    modificarUsuario,
    borrarUsuario,
    login,
    buscarPerfil
}