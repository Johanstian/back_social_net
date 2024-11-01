const JWT = require('jwt-simple');
const moment = require('moment');
const dotenv = require('dotenv');

dotenv.config();

//Clave secreta para generar el tóken
const secret = process.env.SECRET

//Método para generar tókens:
const createToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role,
        iat: moment().unix(), //fecha de emisión
        exp: moment().add(7, 'days').unix() //fecha de expiración
    }

    //Devolver el jwt tóken codificado
    return JWT.encode(payload, secret);
};

module.exports = { secret, createToken }