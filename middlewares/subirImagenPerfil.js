const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    // Configuro el disco de almacenamiento
    destination: function (req, file, cb) {
      cb(null, __dirname + '../../public/uploads/perfiles');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-img-${path.extname(file.originalname)}`);
    },
});

const upload = multer({storage: storage});
  
module.exports = upload;  