// Supaya customer hanya bisa mengubah status booking miliknya saja
// Hanya bisa booking yang berstatus process

const { Booking } = require("../models")

async function authorizationBookingDone(req, res, next) {
    try {
        const { id: bookingId } = req.params;
        const { id: customerId } = req.customer;

        const booking = await Booking.findByPk(bookingId)
        if (!booking) throw { name: "NOTFOUND" }
        if (booking.status !== "process") throw { name: "InvalidBooking"}
        if (booking.CustomerId !== customerId) throw { name: "Forbidden"}

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = authorizationBookingDone