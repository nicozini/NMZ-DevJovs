// Objetivo: validar los campos del formulario de editar perfil del usuario
const {body} = require('express-validator');

module.exports = [
    body('nombre').notEmpty().withMessage('Agrega tu Nombre DESDE MDWRE edit').escape(),
    body('email').notEmpty().withMessage('Agrega tu E-mail DESDE MDWRE edit').escape(),


    // LO DE ABAJO ESTA TODO MAL. NO SE COMO HACER PARA VALIDAR EL PASSWORD SOLO SI EL USUARIO INGRESA OTRO
    // body('password').custom((value, {req}) => {
    //     if (req.body.password) {
    //         let password = req.body.password;
    //         password.escape()
    //     }
    // })
];
