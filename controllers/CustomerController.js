const { Customer, Sequelize, Hotel, Review } = require("../models");
const { jwtSign } = require("../helpers/jwt");
const { decrypt } = require("../helpers/password");
const bcrypt = require("bcryptjs");
class CustomerController {
  //
  static async login(req, res, next) {
    try {
      if (!req.body) throw { name: "NoEmailPassword" };
      const { email, password } = req.body;

      const instanceCustomer = await Customer.findOne({
        where: {
          email,
        },
      });

      if (!instanceCustomer) throw { name: `InvalidEmailPassword` };
      const isValid = bcrypt.compareSync(password, instanceCustomer.password);

      if (!isValid) {
        throw { name: "InvalidEmailPassword" };
      } else {
        const payload = {
          id: instanceCustomer.id,
          fullName: instanceCustomer.name,
        };
        // generate jwt token
        const token = jwtSign(payload);
        res.status(200).json({
          access_token: token,
          fullName: instanceCustomer.name,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    const date = new Date();
    try {
      const { email, password, fullName, phoneNumber } = req.body;
      const newCustomer = await Customer.create({
        email,
        password,
        fullName,
        phoneNumber,
      });

      res.status(201).json({
        status: "Created",
        message: "New Customer has been added",
      });
    } catch (error) {
      next(error);
    }
  }

  //----------------------- REVIEW ------------------------
  static async getReviews(req, res, next) {
    try {
      const { HotelId } = req.params

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: "NOTFOUND" }

      const reviews = await Review.findAll({
        where: { HotelId }, attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })

      res.status(200).json(reviews)
    } catch (error) {
      next(error)
    }
  }

  static async addReview(req, res, next) {
    try {
      const { HotelId, CustomerId } = req.params

      const { comment, rating } = req.body

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: "NOTFOUND" }

      const customer = await Customer.findByPk(CustomerId)

      if (!customer) throw { name: "NOTFOUND" }

      const newReview = await Review.create({ comment, rating, HotelId, CustomerId })

      res.status(201).json(newReview)
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  static async editReview(req, res, next) {
    try {
      const id = req.params.ReviewId

      const { comment, rating } = req.body

      const newReview = await Review.update({ comment, rating }, { where: { id } })

      res.status(201).json({message: `Review with id ${id} has been updated!`})
    } catch (error) {
      next(error)
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const id = req.params.ReviewId

      const deletedReview = await Review.destroy({where: {id}})

      if(deletedReview === 0) throw{name: "NOTFOUND"}

      res.status(200).json({message: `Review with id ${id} deleted successfully!`})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CustomerController;
