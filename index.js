const express = require('express');
require('dotenv').config();
const connection = require('./database/connection');
const cors = require('cors');


console.log('Node exec')
connection();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}))

//RUTAS

const userRoutes = require('./routes/usersRoutes');
const publicationRoutes = require('./routes/publicationRoutes');
const followRoutes = require('./routes/followRoutes');
app.use('/api/user', userRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/follow', followRoutes);

app.listen(port, () => {
    console.log('Server started listening on ' + port)
});

module.exports = app;