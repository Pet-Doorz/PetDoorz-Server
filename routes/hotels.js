const router = require("express").Router();
const HotelController = require("../controllers/HotelController");

router.get("/", HotelController.findNearestHotel);
router.put("/:id", HotelController.update);
router.post("/login", HotelController.login);
router.post("/register", HotelController.register);

module.exports = router;
