const BookingController = require('../controllers/BookingController')
const router = require('express').Router()

router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Bookings Endpoint')
})

router.post("/", BookingController.createBooking)

module.exports = router