const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
// También puedo requerir el modelo así: const Vacante = require('../models/Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');



exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios DESDE AUTH CONTR'
});

// Este método lo llama como middleware en cada ruta haciendo authController.verificarUsuario
// Yo lo implementé en un middleware de autenticación como verificarUsuario
// // Revisar si el usuario esta autenticado o no con métodos de passport
// exports.verificarUsuario = (req,res,next) => {
//     // Revisar el usuario
//     if (req.isAuthenticated()) {
//         // El usuario está autenticado entonces...
//         return next();
//     }

//     res.redirect('/iniciar-sesion');
// }

exports.mostrarPanel = async (req,res) => {

    // Para mostrar las vacantes del propio usuario
    // - Consultar usuario autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean();

    res.render('administracion', {
        nombrePagina: 'Panel de Administración', 
        tagline: 'Crea y Administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req,res) => {
    req.logout();
    req.flash('correcto', 'Cerraste Sesión Correctamente');
    return res.redirect('/iniciar-sesion');
}

// Formulario para Resetear Password
exports.formRestablecerPassword = (req,res) => {
    res.render('restablecer-password', {
        nombrePagina: 'Restablecer Password',
        tagline: 'Si ya tienes unas cuenta pero olvidaste tu password, coloca tu E-mail'
    })
}

// Generar Token en la Tabla de Usuarios
exports.enviarToken = async (req,res) => {
    // Verifico que el usuario a resetear exista en mi DB
    const usuario = await Usuarios.findOne({email: req.body.email});

    if (!usuario) {
        req.flash('error', 'Usuario no encontrado');
        return res.redirect('/iniciar-sesion');
    }

    // El usuario existe, generar token con Crypto
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario en la DB
    await usuario.save();
    // const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
    const resetUrl = `${req.headers.origin}/restablecer-password/${usuario.token}`;

    // Enviar Notificacion por email con Mailtrap
    // Esto viene del metodo enviar creado en email.js de handlers (previamente importado)
    // Recordar que el metodo enviar en el email.js de handlers recibe un objeto. Le envio el usuario completo
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Todo Correcto
    req.flash('correcto', 'Revisa tu email y sigue las indicaciones');
    res.redirect('/iniciar-sesion');
}

// Validar si el Token es valido y el usuario existe, mostrar la vista
exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es válido, intenta nuevamente');
        return res.redirect('/restablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    });
}

// Almacenar el nuevo password en la DB
exports.guardarPassword = async (req,res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es válido, intenta nuevamente');
        return res.redirect('/restablecer-password');
    }

    // Asignar nuevo password y limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // Guardar en la DB
    await usuario.save();

    // Fin del proceso, redirigir
    req.flash('correcto', 'Password modificado correctamente. Inicia sesión!');
    res.redirect('/iniciar-sesion');
}