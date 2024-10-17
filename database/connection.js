const mongoose = require('mongoose');
mongoose.set('strictQuery', false)

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log('Yes connected to Mongodb ' + conn.connection.host);
    } catch (error) {
        console.log('Connect failed ' + error.message);
        process.exit(1);
    }
}

module.exports = connectDB;


// import mongoose, { connect } from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const connection = async() => {
//     try {
//         await connect(process_params.env.MONGODB_URI);
//         console.log('Conectado a la base de datos Social')
//     } catch (error) {
//         console.log('Error al conectar a la base de datos de Mongoose', error);
//         throw new Error('No se ha podido conectar a la base de datos');
//     }
// }

// export default connection;