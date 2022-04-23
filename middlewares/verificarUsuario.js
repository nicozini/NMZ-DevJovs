// Objetivo: verificar si el usuario esta logueado o no (redireccionar a login) utilizando el método de passport

module.exports = (req,res,next) => {
    // Revisar el usuario
    if (req.isAuthenticated()) {
        // El usuario está autenticado entonces...
        return next();
    }
    // Caso contrario, no esta autenticado entonces...
    res.redirect('/iniciar-sesion');
}