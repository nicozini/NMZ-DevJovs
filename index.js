const mongoose = require('mongoose');
const db = require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const indexRouter = require('./routes/indexRouter');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({path: 'variables.env'});

const app = express();

// Habilitar Body Parser
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Habilitar Template Engine Handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, './views'));

// Archivos Estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE})
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y Flash Messages
app.use(flash());

// Middleware de Flash
app.use((req,res,next) => {
    res.locals.mensajes = req.flash();
    next();
});

// Rutas
app.use('/', indexRouter());


// 404 Not Found
app.use((req, res, next) => {
    next(createError(404, 'No Encontrado (desde index con módulo http-errors)'));
});

// Administración de Errores
// En express se accede al error con el .message
app.use((error, req, res, next) => {
    // console.log(error.message);
    // Pongo el error como una variable
    res.locals.mensaje = error.message;    
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
});


// Servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
    `App listening on port ${port}`
});