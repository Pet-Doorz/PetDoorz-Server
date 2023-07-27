const router = require('express').Router();
const bookings = require('./bookings');
const hotels = require('./hotels');
const customers = require('./customers');

router.get('/', (req, res) => {
    res.send('Hello PetDoorz!')
})

router.use("/bookings", bookings);
router.use("/hotels", hotels);
router.use("/customers", customers);

module.exports = router