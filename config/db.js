const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

// Conectar la DB
// El método connect toma dos parámetros: URL y Options
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true});

mongoose.connection.on('error', (error) => {
    console.log(error);
})

// Importar modelos
require('../models/Vacantes');
require('../models/Usuarios');