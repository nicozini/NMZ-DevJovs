const mongoose = require('mongoose');
// Promesa para que las respuestas de mongo sean promesas
mongoose.Promise = global.Promise;
// Para generar las URL de cada registro de la DB y id
const slug = require('slug');
const shortid = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});

// Similar a los Hooks de Sequelize, Mongoose tiene Middlewares
// En este caso en vez de un bedoreCreate() de Sequelize, usamos un .pre() de Mongoose
vacantesSchema.pre('save', function(next) {
    // Crear la URL
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
    next();
});

// Para cuando implemente el buscador, creo un indice
vacantesSchema.index({titulo: 'text'});



// Acá se define el modelo Vacante para el Schema vacantesSchema
module.exports = mongoose.model('Vacante', vacantesSchema);