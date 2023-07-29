const router = require("express").Router();
const CustomerController = require("../controllers/CustomerController");

//customer
router.get("/");
router.post("/login", CustomerController.login);
router.post("/register", CustomerController.register);


//review
router.get('/:HotelId', CustomerController.getReviews)
router.post('/:HotelId/:CustomerId', CustomerController.addReview)
router.put('/:ReviewId', CustomerController.editReview)
router.delete('/:ReviewId', CustomerController.deleteReview)

module.exports = router;
