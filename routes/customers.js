const router = require('express').Router()
const CustomerController = require('../controllers/CustomerController')

router.get('/', (req, res) => {
    res.send('Hello PetDoorz! This is Customers Endpoint')
})

module.exports = router