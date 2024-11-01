const jwt = require('jwt-simple');
const moment = require('moment');
const dotenv = require('dotenv');
// const secret = require('../services/jwt');

dotenv.config();
const secret = process.env.SECRET


//Auth
const auth = (req, res, next) => {
    //Headers
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'error',
            message: 'La petición no tiene headers de auth'
        })
    }
    //Clean el token y quitar comillas
    const token = req.headers.authorization.replace(/['"]+/g, '').replace("Bearer ", "");
    console.log("Token recibido:", token); 

    try {
        //Deco el token
        let payload = jwt.decode(token, secret);
        console.log("Payload decodificado:", payload);
        //Si expiró el token (si date exp es más antigua que la actual)
        if (payload.exp <= moment.unix()) {
            return res.status(401).send({
                status: 'error',
                message: 'El token expiró'
            })
        }

        //Agregar token a datos de user
        req.user = payload;
        next();

    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'El token no es válido'
        })
    }

    //Paso a ejecución al siguiente método

   
};

module.exports = auth;