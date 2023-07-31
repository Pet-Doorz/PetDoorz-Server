const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");
const authenticationCustomer = require("../middlewares/authenticationCustomer");

router.get("/", authenticationCustomer, CustomerController.getCustomerByAccessToken);
router.post("/", CustomerController.register);
router.post("/login", CustomerController.login);
router.get("/:id", CustomerController.readCustomerById);

router.get(
  "/chats/:userId",
  authenticationCustomer,
  CustomerController.getChatHistory
);

router.put("/:id", CustomerController.editCustomer);
router.post("/", CustomerController.register);
router.post(
  "/generate-midtrans-token",
  authenticationCustomer,
  CustomerController.generateMidtrans
);
router.patch(
  "/:id",
  authenticationCustomer,
  CustomerController.addBalanceCustomer
);

module.exports = router;
