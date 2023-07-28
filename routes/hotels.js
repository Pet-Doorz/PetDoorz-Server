const router = require("express").Router();
const HotelController = require("../controllers/HotelController");

router.get("/", HotelController.findNearestHotel);
router.post("/login", HotelController.login);
router.post("/register", HotelController.register);

module.exports = router;
