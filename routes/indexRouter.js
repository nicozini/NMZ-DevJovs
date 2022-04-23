const express = require('express');
const router = express.Router();
// Librería para solucionar que enctype="multipart/form-data" arroje empty req.body
const multipart = require('connect-multiparty');

const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

const validarRegistro = require('../middlewares/validarRegistro');
const verificarUsuario = require('../middlewares/verificarUsuario');
const validarVacante = require('../middlewares/validarVacante');
const multipartMiddleware = multipart();
const validarEditarPerfil = require('../middlewares/validarEditarPerfil');
const upload = require('../middlewares/subirImagenPerfil');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);


    // VACANTES
    // Crear Vacantes
    router.get('/vacantes/nueva', verificarUsuario, validarVacante, vacantesController.formularioNuevaVacante);
    router.post('/vacantes/nueva', verificarUsuario, validarVacante, vacantesController.agregarVacante);

    // Mostrar Vacante Individual
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    // Editar Vacante
    router.get('/vacantes/editar/:url', verificarUsuario, validarVacante, vacantesController.formEditarVacante);
    router.post('/vacantes/editar/:url', verificarUsuario, validarVacante, vacantesController.editarVacante);

    // Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

    // Buscador de Vacantes
    router.post('/buscador', vacantesController.buscarVacantes);


    // USUARIOS
    // Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    // router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);
    router.post('/crear-cuenta', validarRegistro, usuariosController.crearUsuario);

    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    router.get('/cerrar-sesion', verificarUsuario, authController.cerrarSesion);
    
    // Resetear Password (email)
    router.get('/restablecer-password', authController.formRestablecerPassword);
    router.post('/restablecer-password', authController.enviarToken);
    // Resetear Password (almacenar en la DB)
    router.get('/restablecer-password/:token', authController.restablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);

    // Panel de Administración
    router.get('/administracion', verificarUsuario, authController.mostrarPanel);

    // Editar Perfil
    router.get('/editar-perfil', verificarUsuario, usuariosController.formEditarPerfil);
    // Forma DH para aplicar Multer
    // router.post('/editar-perfil', verificarUsuario, multipartMiddleware, validarEditarPerfil, upload.single('imagen'), usuariosController.editarPerfil);
    router.post('/editar-perfil', verificarUsuario, usuariosController.subirImagen, usuariosController.editarPerfil);

    // Recibir Mensajes de Candidatos
    router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.contactar);

    // Mostrar Candidatos por Vacante
    router.get('/candidatos/:id', verificarUsuario, vacantesController.mostrarCandidatos)

    return router;
}