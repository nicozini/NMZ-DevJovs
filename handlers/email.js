const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
const path = require('path');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false, // true for 465, false for other ports
    auth: {
        user: emailConfig.user, // generated ethereal user
        pass: emailConfig.pass, // generated ethereal password
    },
});


// Utilizar template de Handlebars para generar HTML del mail a enviar. Debo setear las configuraciones y crear
// el directorio emails
// transporter.use('compile', hbs({
//     viewEngine: {
//        extname: '.handlebars',
//        partialsDir:  __dirname+'/../views/emails',
//        layoutsDir:  __dirname+'/../views/emails',
//        defaultLayout: 'reset.handlebars',
//     //    defaultLayout: false,
//     },
//     viewPath: __dirname+'/../views/emails',
//     extName: '.handlebars',
// }));

transporter.use('compile', hbs({
    viewEngine: {
        extName: '.handlebars',
        defaultLayout: '',
        partialsDir: path.resolve(__dirname+'/../views/emails'),
        layoutsDir: path.resolve(__dirname+'/../views/emails'),
    },
    viewPath : __dirname+'/../views/emails',
    extName: '.handlebars',
}));

// Este metodo de enviar debo ponerlo disponible en el auth controller (o donde este configurando el metodo de 
// olvidaste tu contraseña, resetear contraseña)
exports.enviar = async (opciones) => {

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'DevJobs <no-reply@devjobs.com>', // sender address
        to: opciones.usuario.email, // list of receivers
        subject: opciones.subject, // Subject line
        template: opciones.archivo,
        // Las variables que le paso al archivo las defino en context, para luego utilizarlas en el template
        // (que esten disponibles en el template)
        context: {
            resetUrl: opciones.resetUrl,

        }
    });

    const sendMail = util.promisify(transporter.sendMail, transporter);
    return sendMail.call(transporter, info);
}