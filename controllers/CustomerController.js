const { Customer, Sequelize } = require("../models");
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
}

module.exports = CustomerController;
