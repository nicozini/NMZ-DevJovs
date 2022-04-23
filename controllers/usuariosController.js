const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
// Recordar que también se puede importar o requerir con el require en lugar de las dos lineas anteriores
// const Usuarios = require('../models/Usuarios');
// const {body, validationResult} = require('express-validator');
const {validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');



exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJovs',
        tagline: 'Comienza a publicar tus vacantes gratis. ¡Crea tu cuenta!'
    })
}


// Crear Usuario (guardar en la DB)
exports.crearUsuario = async (req,res, next) => {
    // Sanitización que viene del middleware con Express Validator
    // await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);
    
    // console.log('IMPRIMO LISTADO DE ERRORES ===============================================');
    // console.log(errores);
    // console.log('IMPRIMO LISTADO DE ERRORES MAPEADOS ===============================================');
    // console.log(errores.mapped());
    // return;

    // Si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));

        res.render('crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en DevJovs',
            tagline: 'Comienza a publicar tus vacantes gratis. ¡Crea tu cuenta!',
            mensajes: req.flash()
        });
        return;
    }
    
    // Si toda la validacion es correcta
    next();

    // Crear el usuario
    const usuario = new Usuarios(req.body);
    
    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        console.log('===========================ERRORSETE');
        console.log(error);
    
        // Estas dos lineas las hace en el curso pero me da error. Validé desde el Middleware. Si se duplica el
        // mail, no va a pasar el middleware, por tanto nunca va a llegar a esta parte
        // req.flash('error', error);
        // res.redirect('/crear-cuenta')
    }
}


// Formulario para iniciar sesión
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión DevJobs'
    });
}

// Formulario para editar perfil
exports.formEditarPerfil = (req,res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en DevJobs',
        cerrarSesion: true,
        nombre: req.user.nombre,
        usuario: req.user.toObject(),
        imagen: req.user.imagen
    });
}

// Guardar cambios de editar perfil
exports.editarPerfil = async (req,res,next) => {

    console.log('=========VEO QUE ME LLEGA=============');
    console.log(req.body);
    console.log(req.body.nombre);
    console.log(req.body.email);
    console.log(req.file);
    
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en DevJobs',
            cerrarSesion: true,
            nombre: req.user.nombre,
            usuario: req.user.toObject(),
            mensajes: req.flash(),
            imagen: req.user.imagen
        });
        return;
    }

    next();

    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body.password) {
        usuario.password = req.body.password;
    }

    // Sobre la imagen de perfil con Multer
    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'Cambios guardados correctamente');

    res.render('administracion');
}

// Subir imágen de perfíl reclutador
exports.subirImagen = (req,res,next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb ');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
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
            cb(null, __dirname+'../../public/uploads/perfiles');
        }, 
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');