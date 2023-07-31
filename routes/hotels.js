const router = require("express").Router();
const HotelController = require("../controllers/HotelController");
const HotelAuthentication = require("../middlewares/authenticationHotel");

router.get("/", HotelController.findNearestHotel);
router.put("/:id", HotelController.update);
router.get(
  "/chats/:userId",
  HotelAuthentication,
  HotelController.getChatHistory
);
router.post("/login", HotelController.login);
router.post("/register", HotelController.register);

//service
router.get("/services/:HotelId", HotelController.getServices);
router.post("/services/:HotelId", HotelController.addService);
router.put("/services/:HotelId/:id", HotelController.updateService);
router.delete("/services/:HotelId/:id", HotelController.deleteService);

//room
router.get("/rooms/:HotelId", HotelController.getRooms);
router.post("/rooms/:HotelId", HotelController.addRoom);
router.put("/rooms/:HotelId/:id", HotelController.updateRoom);
router.delete("/rooms/:HotelId/:id", HotelController.deleteRoom);

module.exports = router;
