const { jwtVerify } = require("../helpers/jwt")
const { User } = require('../models')

async function authentication(req, res, next) {
    try {
        const { access_token } = req.headers
        
        const { id } = jwtVerify(access_token)

        const user = await User.findByPk(id)
        if (!user) throw { name: 'Unauthenticated' }

        req.user = { id }
        
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authentication