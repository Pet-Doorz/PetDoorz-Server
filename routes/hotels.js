const router = require('express').Router()
const HotelController = require('../controllers/HotelController')


router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Hotels Endpoint')
})

module.exports = router