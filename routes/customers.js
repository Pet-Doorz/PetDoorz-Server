const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");

router.get("/");
router.post("/login", CustomerController.login);
router.post("/register", CustomerController.register);

module.exports = router;
