const { Booking, BookingService, Customer, sequelize } = require("../models")

class BookingController {
    static async createBooking(req, res, next) {
        const transaction = await sequelize.transaction()
        try {
            // const { id } = req.user // perlu konfirmasi payload diisi apa aja
            let id = 1
            const { RoomId, checkIn, checkOut, totalPet, grandTotal, petImage, bookingServices } = req.body
            
            const result1 = await Booking.create({
                CustomerId: id, RoomId, checkIn, checkOut, totalPet, grandTotal, petImage
            }, { transaction })

            const bookingServicesArr = bookingServices.map(e => {
                return {
                    BookingId: result1.BookingId,
                    ServiceId: e
                }
            })
            const result2 = await BookingService.bulkCreate(bookingServicesArr, { transaction })
            const customer = await Customer.findByPk(id)
            
            await customer.update({
                balance: customer.balance - grandTotal
            }, { transaction })

            await transaction.commit()

            res.status(201).json({ message: `Booking #${result1.id} with ${result2.length} additional services created`})
        } catch (error) {
            await transaction.rollback()
            next(error)
        }
    }
}

module.exports = BookingController