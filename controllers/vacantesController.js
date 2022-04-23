// Para traer el modelo al controlador, existen dos formas en Mongoose
// - Forma tradicional const Vacante = require('../models/vacantes');
// - Forma Mongoose, requiriendo el modulo (tal cual lo puse en la parte inferior del modelo)
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const {validationResult} = require('express-validator');
const { WebpackOptionsValidationError } = require('webpack');
const multer = require('multer');
const shortid = require('shortid');


exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Completá el formulario y publicá tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
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
    
    try {
        // Almacenar en la DB
        const nuevaVacante = await vacante.save();
        console.log('====================IMPRIMO NUEVA VACANTE');
        console.log(nuevaVacante);
        if(nuevaVacante) {
            return res.redirect(`/vacantes/${nuevaVacante.url}`);
        }
    } catch (error) {
        console.log('====================IMPRIMO EL ERRROR');
        console.log(error);
    }
}

// Mostrar una vacante
exports.mostrarVacante = async (req,res,next) => {
    // El .populate sirve para vincular tablas en MongoDB. Autor es el campo que trae el id en mi DB
    const vacante = await Vacante.findOne({url: req.params.url}).lean().populate('autor');

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
        nombre: req.user.nombre,
        imagen: req.user.imagen
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

// Subir archivos en PDF
exports.subirCV = (req,res,next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}
// Opciones de Multer
const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf') {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}
// Ejecución Multer
const upload = multer(configuracionMulter).single('cv');

// Almacenar candidatos en la DB
exports.contactar = async (req,res,next) => {
    const vacante = await Vacante.findOne({url: req.params.url})

    // Todo mal, no encontro la vacante
    if (!vacante) return next();

    // Todo bien, creo el objeto nuevoCandidato
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        // el .file es lo que genera multer, lo crea multer
        cv: req.file.filename
    }

    // Almacenar Vacante (recordad que lo tengo como Array en la DB)
    // NOTA: .save() is nota a function lo solucione quitando el .lean() de la consulta a la DB ya que no paso
    //       esa vacante a la vista. No la tabajo como texto plano de JS sino como un documento de Mongoose
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // Mensaje Flash y Redirect
    req.flash('correcto', 'Se envió Correctamente tu Curriculum');
    res.redirect('/');
}

// Mostrar los candidatos por vacante
exports.mostrarCandidatos = async (req,res,next) => {    
    const id = req.params.id;
    // console.log(id);
    
    const vacante = await Vacante.findById(id);
    // console.log(vacante);

    // Debo validar que quien creo la vacante es la persona logueada
    // vacante.autor == req.user._id ambos son objetos pero el segundo viene de session por lo que da que son distintos
    // Por eso hago comparacion simple y lo paso a string
    if (vacante.autor != req.user._id.toString()) {
        return next();
    }

    if (!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos de Vacante: ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos.toObject()        
    });
}

// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean();

    // Hago un console.log de la búsqueda. Si da error lo soluciono con un indice en el modelo
    // No se recomienda un indice para todo porque se hace mas lento
    // console.log(vacante);

    // Mostrar las vacantes encontradas
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}