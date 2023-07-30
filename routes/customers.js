const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");

router.get("/");
router.post("/", CustomerController.register);
router.post("/login", CustomerController.login);
router.get("/:id", CustomerController.readCustomerById)
router.put("/:id", CustomerController.editCustomer)

module.exports = router;
