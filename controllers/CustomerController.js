const { Customer, Booking, Review, Sequelize } = require("../models");
const { jwtSign } = require("../helpers/jwt");
const { decrypt } = require("../helpers/password");
const bcrypt = require("bcryptjs");

class CustomerController {
  //
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: "NullEmail" };
      if (!password) throw { name: "NullPassword" };

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
          email: instanceCustomer.email
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

  static async readCustomerById(req, res, next) {
    try {
      const { id } = req.params
      const data = await Customer.findByPk(id, {
        include: [ Booking, Review ],
        attributes: { exclude: ['createdAt', 'updatedAt', "password"] }
      })
      if (!data) throw { name: "NOTFOUND" }
      res.status(200).json(data)
    } catch (error) {
      next(error)
    }
  }

  static async editCustomer(req, res, next) {
    try {
      const { id } = req.params
      const { fullName, password, phoneNumber } = req.body
      const targetCustomer = await Customer.findByPk(id)
      if (!targetCustomer) throw { name: "NOTFOUND" }
      
      await targetCustomer.update({ fullName, password, phoneNumber })
      
      res.status(200).json({ message: `Customer #${id} updated` })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = CustomerController;
