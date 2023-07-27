const router = require("express").Router();
const HotelController = require("../controllers/HotelController");

router.get("/", (req, res) => {
  res.send("Hello PetDoorz! This is Hotels Endpoint");
});

router.post("/login", HotelController.login);
router.post("/register", HotelController.register);

module.exports = router;
