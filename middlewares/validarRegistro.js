// Objetivo: validar los campos de la creación de cuenta de usuario
const { body } = require('express-validator');
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

// Validar y Sanitizar los campos
module.exports = [
    body('nombre').not().isEmpty().withMessage('El nombre es obligatorio DESDE MDWRE').escape(),
    body('email').isEmail().notEmpty().withMessage('El email debe ser válido DESDE MDWRE').normalizeEmail()
        .escape().custom(async (value, {req}) => {
            const usuario = await Usuarios.findOne({email: req.body.email}).lean();
            if (usuario) {
                throw new Error('Ya existe una cuenta registrada con este correo electrónico DESDE MDWRE');
            }
        }),
    body('password').notEmpty().withMessage('El password no puede estar vacío DESDE MDWRE'),
    body('confirmar').not().isEmpty().withMessage('Confirmar password es obligatorio DESDE MDWRE').escape()
        .custom((value, {req}) => {
        // Obtengo valores
        let password = req.body.password;
        let confirmar = req.body.confirmar; 
       
        if (confirmar !== password) {
            throw new Error('El password ingresado no coincide DESDE MDWRE');
        } 

        //Siempre en las validaciones custom retorno true
        return true;
    })
];