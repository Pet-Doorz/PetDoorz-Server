const BookingController = require('../controllers/BookingController')
const authenticationCustomer = require('../middlewares/authenticationCustomer')
const authenticationHotel = require('../middlewares/authenticationHotel')
const authorizationBookingDone = require('../middlewares/authorizationBookingDone')
const authorizationBookingProcess = require('../middlewares/authorizationBookingProcess')
const router = require('express').Router()

router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Bookings Endpoint')
})

// router.post("/", BookingController.createBooking)
// router.patch("/:id/process", BookingController.updateStatusToProcess)
// router.patch("/:id/done", BookingController.updateStatusToDone)
// router.get("/:id", BookingController.readBookingById)

router.post("/", authenticationCustomer, BookingController.createBooking)
router.patch("/:id/process", authenticationHotel, authorizationBookingProcess, BookingController.updateStatusToProcess)
router.patch("/:id/done", authenticationCustomer, authorizationBookingDone, BookingController.updateStatusToDone)

module.exports = router