const { Movie } = require('../models')

async function authorization(req, res, next) {
    try {
        const authorId = req.user.id
        const movieId = +req.params.id

        const movie = await Movie.findByPk(movieId)
        if (!movie) throw ({ name: 'NOTFOUND' })

        if (movie.authorId !== authorId) throw ({ name: 'Unauthenticated' })
        
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authorization