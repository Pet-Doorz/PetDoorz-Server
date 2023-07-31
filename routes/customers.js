const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");
const AuthenticationCustomer = require("../middlewares/authenticationCustomer");
router.get("/");
router.post("/", CustomerController.register);
router.post("/login", CustomerController.login);
router.get("/:id", AuthenticationCustomer, CustomerController.readCustomerById);
router.get(
  "/chats/:userId",
  AuthenticationCustomer,
  CustomerController.getChatHistory
);
router.put("/:id", AuthenticationCustomer, CustomerController.editCustomer);

module.exports = router;
