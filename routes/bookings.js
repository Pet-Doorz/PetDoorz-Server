const BookingController = require('../controllers/BookingController')
const router = require('express').Router()

router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Bookings Endpoint')
})

router.post("/", BookingController.createBooking)
router.patch("/:id/process", BookingController.updateStatusToProcess)
router.patch("/:id/done", BookingController.updateStatusToDone)

module.exports = router