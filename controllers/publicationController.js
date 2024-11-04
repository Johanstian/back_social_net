const Publication = require('../models/publicationModel');
const { followUserIds } = require('../services/followService');

const getPublications = async (req, res, next) => {
    try {
        const publications = await Publication.find();
        res.status(200).json({
            publications
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

const savePublication = async (req, res) => {
    try {
        const params = req.body;
        if (!params.text) {
            return res.status(400).send({
                status: 'error',
                message: 'Debes enviar el texto de la publicación'
            })
        }

        let newPublication = new Publication(params);
        newPublication.user_id = req.user.userId;

        const publicationStored = await newPublication.save();
        if (!publicationStored) {
            return res.status(500).send({
                status: 'error',
                message: 'No se pudo guardar la publicación'
            })
        }

        return res.status(200).json({
            status: 'succcess',
            message: 'Publicación creada con éxito',
            publicationStored
        })
    } catch (error) {
        console.log('Error al crear la publicación', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al crear la publicación'
        })
    }
}

const showPublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const publicationStored = await Publication.findById(publicationId).populate('user_id', 'name last_name');
        if (!publicationStored) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe la publicación'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Publicación encontrada',
            publication: publicationStored
        })
    } catch (error) {
        console.log('Error al mostrar la publicación', error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al mostrar la publicación'
        })
    }
}

const deletePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const publicationDeleted = await Publication.findOneAndDelete({ user_id: req.user.userId, _id: publicationId }).populate('user_id', 'name last_name');
        if (!publicationDeleted) {
            return res.status(404).send({
                status: 'error',
                message: 'No se ha encontrado o no tiene permiso para eliminar la publicación'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Publicación eliminada',
            publication: publicationDeleted
        })

    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al eliminar la publicación'
        })
    }
}

const publicationUser = async (req, res) => {
    try {
        const userId = req.params.id;
        let page = req.params.page ? parseInt(req.params.page, 10) : 1;
        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;
        const options = {
            page: page,
            limit: itemsPerPage,
            sort: { created_at: -1 },
            populate: {
                path: 'user_id',
                select: '-password -role -__v -email'
            },
            lean: true
        }
        const publications = await Publication.paginate({ user_id: userId }, options);
        if (!publications.docs || !publications.docs.length < 0) {
            return res.status(404).send({
                status: 'error',
                message: 'No hay publicaciones del usuario'
            })
        }
        return res.status(200).json({
            status: 'success',
            message: 'Publicaciones de usuario: ',
            publications: publications.docs,
            total: publications.totalDocs,
            pages: publications.totalPages,
            page: publications.page,
            limit_items_ppage: publications.limit
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al mostrar las publicaciones del usuario'
        })
    }
}

const uploadMedia = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const publicationExists = await Publication.findById(publicationId)

        if (!publicationExists) {
            return res.status(404).send({
                status: 'error',
                message: 'No existe la publicación'
            })
        }

        if (!req.file) {
            return res.status(400).send({
                status: 'error',
                message: 'La petición no incluye la imagen'
            })
        }

        const mediaUrl = req.file.path;
        const publicationUpdated = await Publication.findByIdAndUpdate(
            publicationId,
            { file: mediaUrl },
            { new: true }
        )

        if (!publicationUpdated) {
            return res.status(500).send({
                status: 'error',
                message: 'Error en subida de imagen'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Archivo subido con éxito',
            publication: publicationUpdated,
            file: mediaUrl
        })
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al mostrar las publicaciones del usuario'
        })
    }
}

const showMedia = async (req, res) => {
    try {
        // Obtener el id de la publicación
        const publicationId = req.params.id;
        // Buscar la publicación en la base de datos
        const publication = await Publication.findById(publicationId).select('file');
        // Verificar si la publicación existe y tiene un archivo
        if (!publication || !publication.file) {
            return res.status(404).send({
                status: "error",
                message: "No existe el archivo para esta publicación"
            });
        }
        // Redirigir a la URL de la imagen en Cloudinary
        return res.redirect(publication.file);

    } catch (error) {
        console.error("Error al mostrar el archivo de la publicación", error);
        return res.status(500).send({
            status: "error",
            message: "Error al mostrar archivo en la publicación"
        });
    }
}

const feed = async (req, res) => {
    try {
      // Asignar el número de página
      let page = req.params.page ? parseInt(req.params.page, 10) : 1;
  
      // Número de publicaciones que queremos mostrar por página
      let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;
      // Verificar que el usuario autenticado existe y tiene un userId
      if(!req.user || !req.user.userId) {
        return res.status(404).send({
          status: "error",
          message: "Usuario no autenticado"
        });
      }
      // Obtener un array de IDs de los usuarios que sigue el usuario autenticado
      const myFollows = await followUserIds(req);
      // Verificar que la lista de usuarios que sigo no esté vacía
      if (!myFollows.following || myFollows.following.length === 0){
        return res.status(404).send({
          status: "error",
          message: "No sigues a ningún usuario, no hay publicaciones que mostrar"
        });
      }
      // Configurar las options de la consulta
      const options = {
        page: page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        populate: {
          path: 'user_id',
          select: '-password -role -__v -email'
        },
        lean: true
      };
      // Consulta a la base de datos con paginate
      const result = await Publication.paginate(
        { user_id: { $in: myFollows.following }},
        options
      );
      // Verificar si se encontraron publicaciones en la BD
      if (!result.docs || result.docs.length <= 0) {
        return res.status(404).send({
          status: "error",
          message: "No hay publicaciones para mostrar"
        });
      }
      // Devolver respuesta exitosa
      return res.status(200).json({
        status: "success",
        message: "Feed de Publicaciones",
        publications: result.docs,
        total: result.totalDocs,
        pages: result.totalPages,
        page: result.page,
        limit: result.limit
      });
  
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al mostrar las publicaciones en el feed"
      });
    }
  }



module.exports = { getPublications, savePublication, showPublication, deletePublication, publicationUser, uploadMedia, showMedia, feed }