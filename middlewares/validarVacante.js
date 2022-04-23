// Objetivo: validar los campos de la creación de una vacante
const {body} = require('express-validator');

// Nota: trix (editor de texto) ya valida el mismo sus campos. Esa parte no la incluyo (name="descripcion")
// Por mi modelo de negocio, no es necesario que pongan el salario. Tampoco lo valido
module.exports = [
    body('titulo').notEmpty().withMessage('Agrega un Título a la Vacante DESDE MDWRE').escape(),
    body('empresa').notEmpty().withMessage('Agrega una Empresa DESDE MDWRE').escape(),
    body('ubicacion').notEmpty().withMessage('Agrega una Ubicación DESDE MDWRE').escape(),
    body('contrato').notEmpty().withMessage('Selecciona el Tipo de Contrato DESDE MDWRE').escape(),
    body('skills').notEmpty().withMessage('Las habilidades son obligatorias DESDE MDWRE').escape()
];