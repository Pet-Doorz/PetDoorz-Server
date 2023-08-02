const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");
const HotelController = require("../controllers/HotelController");
const authenticationHotel = require("../middlewares/authenticationHotel");

router.get("/", HotelController.findNearestHotel);
router.put("/", authenticationHotel, HotelController.update);
router.post("/login", HotelController.login);
router.post("/register", HotelController.register);
router.get("/detail", authenticationHotel, HotelController.hotelByAuth);
router.patch("/", authenticationHotel, HotelController.changeStatus);

router.get(
  "/chats/:userId",
  authenticationHotel,
  HotelController.getChatHistory
);

router.get("/imagekit", HotelController.getImagekitSignature);

//service
router.get("/services", authenticationHotel, HotelController.getServices);
router.post("/services", authenticationHotel, HotelController.addService);
router.put("/services/:id", authenticationHotel, HotelController.updateService);
router.delete(
  "/services/:id",
  authenticationHotel,
  HotelController.deleteService
);

//room
router.get("/rooms", authenticationHotel, HotelController.getRooms);
router.post("/rooms", authenticationHotel, HotelController.addRoom);
router.put("/rooms/:id", authenticationHotel, HotelController.updateRoom);
router.delete("/rooms/:id", authenticationHotel, HotelController.deleteRoom);

// TANPA AUTH
// router.get("/:id", HotelController.hotelById)

// //service
// router.get("/services/:HotelId", HotelController.getServices);
// router.post("/services/:HotelId", HotelController.addService);
// router.put("/services/:HotelId/:id", HotelController.updateService);
// router.delete("/services/:HotelId/:id", HotelController.deleteService);

// //room
// router.get("/rooms/:HotelId", HotelController.getRooms);
// router.post("/rooms/:HotelId", HotelController.addRoom);
// router.put("/rooms/:HotelId/:id",HotelController.updateRoom);
// router.delete("/rooms/:HotelId/:id", HotelController.deleteRoom);

module.exports = router;
