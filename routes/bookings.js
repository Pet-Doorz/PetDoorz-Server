const BookingController = require('../controllers/BookingController')
const router = require('express').Router()

router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Bookings Endpoint')
})

module.exports = router