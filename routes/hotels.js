const router = require("express").Router();
const HotelController = require("../controllers/HotelController");

router.get("/", (req, res) => {
  res.send("Hello PetDoorz! This is Hotels Endpoint");
});

router.get("/login", HotelController.login);
router.get("/login", HotelController.register);

module.exports = router;
