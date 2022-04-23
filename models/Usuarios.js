const mongoose = require('mongoose');
// Promesa para que las respuestas de mongo sean promesas
mongoose.Promise = global.Promise;

const bcryptjs = require('bcryptjs');

const usuariosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

// Método para hashear password
usuariosSchema.pre('save', async function(next) {
    // Si el password ya está hasheado
    if (!this.isModified('password')) {
        return next();
    }

    // Si el password no está hasheado
    // Recordad que en Mongoose toda referencia al objeto se hace con this, no (por ejemplo) usuario.password
    const hash = await bcryptjs.hashSync(this.password, 12);
    this.password = hash;
    next();
});

// Error de Mongo: un mail que ya existe. Se realiza con .post no con .pre
usuariosSchema.post('save', function(error, doc, next) {
    if(error.name === 'MongoServerError' && error.code === 11000) {
        next('Correo electrónico ya registrado DESDE SCHEMA');
    } else {
        // Puede suceder que el error que ocurre no sea el de el código 11000
        next(error);
    }
});

// Autenticar Usuarios con Mongoose
usuariosSchema.methods = {
    compararPassword: function(password) {
        return bcryptjs.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);