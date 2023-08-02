const { Booking, BookingService, Customer, Hotel, sequelize } = require("../models")

class BookingController {
    static async createBooking(req, res, next) {
        const transaction = await sequelize.transaction()
        try {
            const { id } = req.customer
            const { RoomId, checkIn, checkOut, totalPet, grandTotal, bookingServices } = req.body
            
            // create booking
            const result1 = await Booking.create({
                CustomerId: id, RoomId, checkIn, checkOut, totalPet, grandTotal
            }, { transaction })
            
            // create bookingServices
            const bookingServicesArr = bookingServices.map(e => {
                return {
                    BookingId: result1.id,
                    ServiceId: e
                }
            })
            const result2 = await BookingService.bulkCreate(bookingServicesArr, { transaction })
            
            // update balance
            const customer = await Customer.findByPk(id)
            await customer.update({
                balance: customer.balance - grandTotal
            }, { transaction })

            // sequelize transaction commit
            await transaction.commit()

            res.status(201).json({ message: `Booking #${result1.id} with ${result2.length} additional services created`})
        } catch (error) {
            await transaction.rollback()
            next(error)
        }
    }

    static async updateStatusToProcess(req, res, next) {
        try {
            const { id } = req.params
            const { petImage } = req.body
            
            if (!petImage) throw { name: "NullPetImage" }            
            await Booking.update({ petImage, status: "process" }, { where: { id } })
            res.status(200).json({ message: `Booking #${id} status updated to 'process'` })
        } catch (error) {
            next(error)
        }
    }

    static async updateStatusToDone(req, res, next) {
        try {
            const { id } = req.params
            await Booking.update({ status: "done" }, { where: { id } })
            res.status(200).json({ message: `Booking #${id} status updated to 'done'` })
        } catch (error) {
            next(error)
        }
    }

    // sepertinya tidak terpakai di app, ada wacana data booking di-fetch in bulk
    static async readBookingById(req, res, next) {
        try {
            const { id } = req.params
            const data = await Booking.findByPk(id)
            if (!data) throw { name: "NOTFOUND"}
            res.status(200).json(data)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = BookingController