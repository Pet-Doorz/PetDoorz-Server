const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");
const authenticationCustomer = require("../middlewares/authenticationCustomer");


router.get("/", authenticationCustomer, CustomerController.readCustomerById);
router.post("/", CustomerController.register);
router.put("/", authenticationCustomer, CustomerController.editCustomer);
router.post("/login", CustomerController.login);

router.get(
  "/chats/:userId",
  authenticationCustomer,
  CustomerController.getChatHistory
);

router.post(
  "/generate-midtrans-token",
  authenticationCustomer,
  CustomerController.generateMidtrans
);
router.patch(
  "/",
  CustomerController.addBalanceCustomer
);

// Untuk keperluan development
router.get("/:id", CustomerController.readCustomerById);
router.put("/:id", CustomerController.editCustomer);


module.exports = router;
