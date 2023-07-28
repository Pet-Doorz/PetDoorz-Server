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

    static async updateStatusToProcess(req, res, next) {
        try {
            // authorization di middleware terpisah, cek id Booking dan id Admin sesuai/tidak
            const { id } = req.params
            const { petImage } = req.body

            const booking = await Booking.findByPk(id)
            if (booking.status !== "booked") throw { name: "InvalidBooking"}

            await booking.update({ petImage: "", status: "process" })
            res.status(200).json({ message: `Booking #${id} status updated to 'process'` })
        } catch (error) {
            next(error)
        }
    }

    static async updateStatusToDone(req, res, next) {
        try {
            // authorization di middleware terpisah, cek id Booking dan id Customer sesuai/tidak
            const { id } = req.params

            const booking = await Booking.findByPk(id)
            if (booking.status !== "process") throw { name: "InvalidBooking"}

            await booking.update({ status: "done" })
            res.status(200).json({ message: `Booking #${id} status updated to 'done'` })
        } catch (error) {
            next(error)
        }
    }

    // Butuh read by ID

    // Butuh read by customerId --> langsyung
    // Butuh read by adminId --> dari hotel
}

module.exports = BookingController