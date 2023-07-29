const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");

router.get("/");
router.get("/:id", CustomerController.readCustomerById)
router.put("/:id", CustomerController.editCustomer)
router.post("/login", CustomerController.login);
router.post("/", CustomerController.register);

module.exports = router;
