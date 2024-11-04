const User = require('../models/userModel');
const Follow = require('../models/followModel');
const Publication = require('../models/publicationModel');
const bcrypt = require('bcrypt');
const jwtService = require('../services/jwt');
const cloudinary = require('multer-storage-cloudinary');
const { followThisUser, followUserIds } = require('../services/followService');

const testUser = (req, res) => {
    return res.status(200).send({
        message: 'Controller de PRUEBA'
    })
}

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            users
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

const createUser = async (req, res) => {
    try {
        let params = req.body;
        if (!params.name || !params.last_name || !params.nick || !params.email || !params.password) {
            return res.status(400).json({
                status: 'Error',
                message: 'Faltan datos por enviar'
            })
        }

        let user_to_save = new User(params);

        const existingUser = await User.findOne({
            $or: [{ email: user_to_save.email.toLowerCase() }, { nick: user_to_save.nick.toLowerCase() }]
        });
        if (existingUser) {
            return res.status(409).send({
                status: 'error',
                message: '¡El nick y/o email ya existe en la base de datos!'
            })
        }

        //Genera los saltos para encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        //Hash es utilizar el password y encriptarlo
        const hashedPassword = await bcrypt.hash(user_to_save.password, salt);
        //Asignar la contraseña encriptada al objeto del usuario
        user_to_save.password = hashedPassword;

        await user_to_save.save();

        return res.status(201).json({
            status: 'created',
            message: 'Register OK',
            user_to_save,
        })
    } catch (error) {
        console.log('Error en Create User', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error en Create User'
        })
    }
}

//Aquí vamos a usar JWT JSON WEB TOKEN, crear un token, clave privada, para trabajar el Front, va al backend, clave temporal
//y se revisa que sean iguales para autorizar a la persona.

const login = async (req, res, next) => {
    try {
        //Obtener los parámetros del body (en la petición)
        let params = req.body
        if (!params.email || !params.password) {
            return res.status(400).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })
        }
        //Si existe en base de datos
        const user = await User.findOne({ email: params.email.toLowerCase() });
        if (!user) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        //Comprobar la contraseña
        const validPassword = await bcrypt.compare(params.password, user.password);
        if (!validPassword) {
            return res.status(401).send({
                status: 'error',
                message: 'Contraseña incorrecta'
            });
        }
        //GENERAR TOKEN de autenticación JWT
        const token = jwtService.createToken(user);
        //Respuesta del login exitoso
        return res.status(200).json({
            status: 'success',
            message: 'Inicio de sesión OK',
            token,
            user: {
                id: user._id,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                profession: user.profession,
                nick: user.nick,
                image: user.image,
            }
        })
    } catch (error) {
        console.log('Error en la autenticación del usuario', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error en la autenticación del usuario'
        })
    }
};

const profile = async (req, res) => {
    try {
        //Get id de user de params de url
        const userId = req.params.id;

        if (!req.user || !req.user.userId) {
            return res.status(401).send({
                status: 'error',
                message: 'Usuario no autenticado'
            });
        }
        //Buscar user en db y excluir datos que no mostrar
        const userProfile = await User.findById(userId).select('-password -role -email -__v');

        if (!userProfile) {
            return res.status(400).send({
                status: 'error',
                message: 'Usuario no encontrado'
            })
        }
        const followInfo = await followThisUser(req.user.userId, userId);
        //return info del profile
        return res.status(200).json({
            status: 'success',
            user: userProfile,
            followInfo
        })
    } catch (error) {
        console.log('Error al obtener el perfil del usuario', error)
        return res.status(500).send({
            status: 'error',
            message: 'Error al obtener el perfil del usuario'
        })
    }
}

//Listar los users
const listUsers = async (req, res) => {
    try {
        //Gestionar paginación
        //Controlar la página actual
        let page = req.params.page ? parseInt(req.params.page, 10) : 1;
        //Config items por página a mostrar
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 3;
        //Que haga consulta paginada
        const options = {
            page: page,
            limit: itemsPerPage,
            select: '-password -email -role -__v'
        }
        const users = await User.paginate({}, options);
        //Sino existen users creados en la BD
        if (!users || !users.docs.length === 0) {
            return res.status(404).send({
                status: 'error',
                message: 'No existen usuarios creados'
            })
        }
        let followUsers = await followUserIds(req);


        //Devolver los usuarios paginados
        return res.status(200).json({
            status: 'success',
            users: users.docs,
            totalDocs: users.totalDocs,
            totalPages: users.totalPages,
            currentPage: users.page,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        })

    } catch (error) {
        console.log('Error al listar los usuarios', error)
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios'
        })
    }
}

//update

const updateUser = async (req, res) => {
    try {
        //Obtener la info del usuario a actualiar
        let userIdentity = req.user;
        let userToUpdate = req.body;
        //Eliminar campos que sobran porque no se van a usar
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        //Comprobar que el user esté en la base de datos
        const users = await User.find({
            $or: [{ email: userToUpdate.email }, { nick: userToUpdate.nick }]
        }).exec()
        //Verifica si hay user duplicado
        const isDuplicateUSer = users.some(user => {
            return user && user._id.toString() !== userIdentity.userId;
        })
        if (isDuplicateUSer) {
            return res.status(400).send({
                status: 'error',
                message: 'Error, solo se puede actualizar los datos del usuario logueado'
            })
        }
        //Cifrar contraseña
        if (userToUpdate.password) {
            try {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
            } catch (hashError) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al cifrar la contraseña'
                })
            }
        } else {
            delete userToUpdate.password;
        }
        //buscar y actualizar
        let userUpdated = await User.findByIdAndUpdate(userIdentity.userId, userToUpdate, { new: true })
        console.log(userUpdated)

        if (!userUpdated) {
            return res.status(400).send({
                status: 'error',
                message: 'Error al actualizar el usuario'
            })
        }
        return res.status(200).json({
            status: 'success',
            message: 'Actualizado',
            user: userUpdated
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al actualizar el usuario'
        })
    }
}

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                status: 'error',
                message: 'No incluye la imagen'
            })
        }

        const avatarUrl = req.file.path;
        const userAvatar = await User.findByIdAndUpdate(
            req.user.userId,
            { image: avatarUrl },
            { new: true }
        )

        if (!userAvatar) {
            return res.status(500).send({
                status: 'error',
                message: 'Error al cargar avatar'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Actualizado',
            user: userAvatar,
            file: avatarUrl
        })
    } catch (error) {
        console.log('Error al subir avatar', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al subir avatar'
        })
    }
}

const getAvatar = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('image');

        if (!user || !user.image) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no existe o no tiene avatar'
            });
        }
        return res.status(200).send({
            status: 'success',
            imageUrl: user.image
        });
        // return res.redirect(user.image)
    } catch (error) {
        console.log('Error al obtener avatar', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al obtener avatar'
        });
    }
};

const counters = async (req, res) => {
    try {
        // Obtener el Id del usuario autenticado (token)
        let userId = req.user.userId;
        // Si llega el id a través de los parámetros en la URL tiene prioridad
        if (req.params.id) {
            userId = req.params.id;
        }
        // Obtener el nombre y apellido del usuario
        const user = await User.findById(userId, { name: 1, last_name: 1 });
        // Vericar el user
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }
        // Contador de usuarios que yo sigo (o que sigue el usuario autenticado)
        const followingCount = await Follow.countDocuments({ "following_user": userId });
        // Contador de usuarios que me siguen a mi (que siguen al usuario autenticado)
        const followedCount = await Follow.countDocuments({ "followed_user": userId });
        // Contador de publicaciones del usuario autenticado
        const publicationsCount = await Publication.countDocuments({ "user_id": userId });
        // Devolver los contadores
        return res.status(200).json({
            status: "success",
            userId,
            name: user.name,
            last_name: user.last_name,
            followingCount: followingCount,
            followedCount: followedCount,
            publicationsCount: publicationsCount
        });

    } catch (error) {
        console.log("Error en los contadores", error)
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores"
        });
    }
}

module.exports = { testUser, getUsers, createUser, login, profile, listUsers, updateUser, uploadAvatar, getAvatar, counters }