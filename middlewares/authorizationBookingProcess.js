// Supaya hotel hanya bisa update status booking miliknya
// Hanya bisa booking yang berstatus booked

const { Booking, Room, Hotel } = require("../models")

async function authorizationBookingProcess(req, res, next) {
    try {
        const { id: bookingId } = req.params;
        const { id: hotelId } = req.hotel;

        const booking = await Booking.findByPk(bookingId, {
            include: {
                model: Room,
                include: Hotel
            }
        })
        console.log(booking.Room.Hotel.id)
        if (!booking) throw { name: "NOTFOUND" }
        if (booking.status !== "booked") throw { name: "InvalidBooking"}
        if (booking.Room.Hotel.id !== hotelId) throw { name: "Forbidden"}

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authorizationBookingProcess