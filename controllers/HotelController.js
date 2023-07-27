const { jwtSign } = require("../helpers/jwt");
const { decrypt } = require("../helpers/password");
const { Hotel } = require("../models");

class HotelController {
  static async login(req, res, next) {
    try {
      if (!email || !password) throw { name: "NoEmailPassword" };

      const { email, password } = req.body;

      const instanceHotel = await Hotel.findOne({
        where: {
          email,
        },
      });

      if (!instanceHotel) throw { name: `InvalidEmailPassword` };
      const isValid = decrypt.compare(password, instanceHotel.password);

      if (!isValid) {
        throw { name: "InvalidEmailPassword" };
      } else {
        const payload = {
          id: instanceHotel.id,
          name: instanceHotel.name,
        };
        // generate jwt token
        const token = jwtSign(payload);
        res.status(200).json({
          access_token: token,
          name: instanceHotel.name,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    const date = new Date();
    try {
      const { email, password, name, location, balance, logoHotel } = req.body;

      const newHotel = await Hotel.create({
        email,
        password,
        name,
        location,
        balance,
        logoHotel,
      });

      res.status(201).json({
        status: "Created",
        message: "New Hotel has been added",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HotelController;
