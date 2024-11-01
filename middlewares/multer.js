// const multer = require('multer');

// const storage = multer.diskStorage({
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// });

// const upload = multer({storage: storage});

// module.exports = upload;


const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento de multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: function(req, file, cb) {
        // Puedes cambiar el nombre del archivo si es necesario
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
