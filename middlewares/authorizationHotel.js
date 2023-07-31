// Supaya hotel hanya bisa RU data miliknya
const { Hotel } = require("../models")

async function authorizationHotel(req, res, next) {
    try {
        const { id } = req.params
        const { id: authenticationId } = req.hotel

        const hotel = await Hotel.findByPk(id)
        if (hotel.id !== authenticationId) throw { name: "Forbidden" }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authorizationHotel