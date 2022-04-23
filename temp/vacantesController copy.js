// Para traer el modelo al controlador, existen dos formas en Mongoose
// - Forma tradicional const Vacante = require('../models/vacantes');
// - Forma Mongoose, requiriendo el modulo (tal cual lo puse en la parte inferior del modelo)
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const {validationResult} = require('express-validator');
const { WebpackOptionsValidationError } = require('webpack');


exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Completá el formulario y publicá tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// Agregar vacantes a la DB
exports.agregarVacante = async (req,res,next) => {

    const errores = validationResult(req);

    console.log('=========IMPRIMO MIS ERRORES=========================================');
    console.log(errores);

    // Si hay errores
    if(!errores.isEmpty()) {
        // Recargar la vista con los errores
        req.flash('error', errores.array().map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Completá el formulario y publicá tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
        return;
    }
    // Si no hay errores
    next();

    const vacante = new Vacante(req.body);
    console.log(vacante);

    //--> Esto lo agrego luego de la autenticacion. El usuario autenticado NO es parte del req.body. Lo agrego:
    // Usuario autor de la vacante
    vacante.autor = req.user._id;
    console.log('==== CREO VACANTE, IMPRIMO EL USUARIO LOGUEADO CON REQ.USER=====')
    console.log(req.user);

    // Crear arreglo de skill porque en el req.body vienen como un string separado por comas
    vacante.skills = req.body.skills.split(',');

    // Almacenar en la DB
    const nuevaVacante = await vacante.save()

    console.log('==============IMPRIMO NUEVA VACANTE');
    console.log(nuevaVacante);
    console.log('==============IMPRIMO NUEVA VACANTE');
    console.log(req);

    // Acción de cierre es redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// Mostrar una vacante
exports.mostrarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    if (!vacante) return next();

    res.render('vacante', {
        nombrePagina: vacante.titulo,
        vacante,
        barra: true
    })
}

// Formulario Editar vacante
exports.formEditarVacante = async (req,res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    if (!vacante) return next();

    res.render('editar-vacante', {
        nombrePagina: `Editar - ${vacante.titulo}`,
        vacante: vacante,
        cerrarSesion: true,
        nombre: req.user.nombre
    })
}

// Guardar la edición en la DB
exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body;

    // Para que las skills sean un array
    vacanteActualizada.skills = req.body.skills.split(',');

    // Utilizo el método .findOneAndUpdate de Mongoose
    // Parametros: documento a actualizar, con que lo actualizo y opciones
    //  - new para traer los registris nuevos
    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

// Eliminar Vacante de la DB
exports.eliminarVacante = async (req,res) => {
    const id = req.params.id;
    
    const vacante = await Vacante.findById(id);
    console.log(vacante);

    // Antes de eliminar debo verificar que quien elimina es el usuario que la creo
    if(verificarAutor(vacante, req.user)) {
        // True: eliminar vacante
        res.status(200).send('Vacante Eliminada Correctamente desde CTRLLER');
        // await Vacante.deleteOne({ _id: id });
        vacante.remove();
    } else {
        // False: no permitido
        res.status(403).send('Error desde CTRLLER');
    }    
}
const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    } 
    return true;
}