const router = require("express").Router();
const HotelController = require("../controllers/HotelController");

router.get("/", HotelController.findNearestHotel);
router.post("/login", HotelController.login);
router.post("/register", HotelController.register);

//service
router.get('/services/:HotelId', HotelController.getServices)
router.post('/services/:HotelId', HotelController.addService)
router.put('/services/:HotelId/:id', HotelController.updateService)
router.delete('/services/:HotelId/:id', HotelController.deleteService)

module.exports = router;
