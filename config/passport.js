const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    // Indico con cuales campos de mi modelo se van a autenticar los usuarios
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {

    // 1 - Consulta a la DB buscando el usuario que se loguea
    const usuario = await Usuarios.findOne({
        email: email
    })

    // 2 - Caso que no existe usuario
    if(!usuario) return done(null, false, {
        message: 'Usuario no encontrado DESDE PASSP'
    });

    // 3 - Caso que existe el usuario y debo verificarlo
    const verificarPassword = usuario.compararPassword(password);
    if (!verificarPassword) return done(null, false, {
        message: 'Password incorrecto DESDE PASSP'
    });

    // 4 - Usuario existe y password es correcto
    return done(null, usuario);
}));


// Requisito de passport: SERIALIZAR el usuario (acceder/leer valores del objeto usuario)
// .serializeUser() toma dos parametros: usuario y callback que es done
// usuario ._id es porque en la DB de Mongo, este ya lo crea así
passport.serializeUser((usuario, done) => {
    done(null, usuario._id);
});

// Requisito de passport: DESERIALIZAR el usuario
passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
});

// Exportar
module.exports = passport;