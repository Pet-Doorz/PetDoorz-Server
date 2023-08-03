const {
  Customer,
  Booking,
  Review,
  TopUp,
  Room,
  Hotel,
  BookingService,
  Service,
  Sequelize,
} = require("../models");
const { jwtSign } = require("../helpers/jwt");
const { decrypt, encrypt } = require("../helpers/password");
const bcrypt = require("bcryptjs");
const midtransClient = require("midtrans-client");
const getChatHistory = require("../helpers/thirdPartyRequest");
const uuid = require("uuid");
const crypto = require("crypto");

class CustomerController {
  //
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      console.log(email, password, "MASUK");
      if (!email) throw { name: "NullEmail" };
      if (!password) throw { name: "NullPassword" };

      const instanceCustomer = await Customer.findOne({
        where: {
          email,
        },
      });

      if (!instanceCustomer) throw { name: `InvalidEmailPassword` };
      const isValid = decrypt(password, instanceCustomer.password);

      if (!isValid) {
        throw { name: "InvalidEmailPassword" };
      } else {
        const payload = {
          id: instanceCustomer.id,
          fullName: instanceCustomer.fullName,
          email: instanceCustomer.email, // saya tambahin, soalnya butuh email di authCustomer dan generate midtrans
        };
        // generate jwt token
        const token = jwtSign(payload);
        res.status(200).json({
          access_token: token,
          fullName: instanceCustomer.name,
          email: instanceCustomer.email,
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
      const { id } = req.customer || req.params;
      const data = await Customer.findByPk(id, {
        include: [
          Review,
          {
            model: Booking,
            include: [
              {
                model: Room,
                include: { model: Hotel, attributes: ["name", "email", "id"] },
              },
              {
                model: BookingService,
                include: Service,
              },
            ],
          },
        ],
        attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      });
      if (!data) throw { name: "NOTFOUND" };
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async editCustomer(req, res, next) {
    try {
      const { id } = req.customer || req.params;
      const { fullName, password, phoneNumber } = req.body;
      const targetCustomer = await Customer.findByPk(id);
      if (!targetCustomer) throw { name: "NOTFOUND" };

      await targetCustomer.update({
        fullName,
        password: encrypt(password),
        phoneNumber,
      });

      res.status(200).json({ message: `Customer #${id} updated` });
    } catch (error) {
      next(error);
    }
  }

  static async generateMidtrans(req, res, next) {
    try {
      // dapetin grand total dulu
      const { total } = req.body; // harus dapet total price dari client
      const order_id = "TX" + Math.floor(Math.random() * 90000);

      // dapetin email customer, dapetin customer dari authentication customer
      const customer = await Customer.findByPk(req.customer.id);
      const topUp = await TopUp.create({
        CustomerId: customer.id,
        orderId: order_id,
        total,
      });

      // ini buat create snap paymentnya, ENV jangan lupa
      let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      // parameter yang dibutuhin midtrans
      let parameter = {
        transaction_details: {
          order_id, // order ID harus unique, jadi gua giniin aja ya
          gross_amount: total,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          email: customer.email,
        },
      };

      const midtransToken = await snap.createTransaction(parameter);
      res.status(201).json(midtransToken);
    } catch (error) {
      next(error);
    }
  }

  static async addBalanceCustomer(req, res, next) {
    try {
      const { order_id } = req.body;

      const order = await TopUp.findOne({
        where: {
          orderId: order_id,
        },
      });

      console.log(order);

      const customer = await Customer.findByPk(order.CustomerId);

      await customer.update({
        balance: customer.balance + order.total, // total dari req.body bentuknye string, kudu diubah duls
      });

      res.status(200).json({ message: "Success add balance" });
    } catch (error) {
      next(error);
    }
  }

  static async getChatHistory(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await getChatHistory(userId);
      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerByAccessToken(req, res, next) {
    try {
      const { id } = req.customer;
      const data = await Customer.findByPk(id, {
        include: [Booking, Review],
        attributes: { exclude: ["createdAt", "updatedAt", "password"] },
      });
      if (!data) throw { name: "NOTFOUND" };
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req, res, next) {
    try {
      const { id } = req.customer
      const { rating, comment, bookingId, HotelId } = req.body

      const data = await Review.create({ rating, comment, bookingId, HotelId, CustomerId: id })
      
      res.status(201).json({ message: `Review #${data.id} created`})
    } catch (error) {
      next(error)
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params
      const data = await Review.destroy({ where: { id }})
      
      res.status(200).json({ message: `Review #${id} deleted`})
    } catch (error) {
      next(error)
    }
  }

  static async getReview(req, res, next) {
    try {
      const { id } = req.customer

      const data = await Review.findAll({
        where: {
          CustomerId: id
        }
      })

      res.status(200).json(data)
    } catch (error) {
      next(error)
    }
  }

  // -------------- IMAGEKIT -------------
  static getImagekitSignature(req, res, next) {
    try {
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      var token = req.query.token || uuid.v4();
      var expire = req.query.expire || parseInt(Date.now() / 1000) + 2400;
      var privateAPIKey = `${privateKey}`;
      var signature = crypto
        .createHmac("sha1", privateAPIKey)
        .update(token + expire)
        .digest("hex");

      res.status(200).json({
        token: token,
        expire: expire,
        signature: signature,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHotelEmail(req, res, next) {
    try {
      console.log(req.params);
      const { access_token } = req.headers;
      const { id } = req.params;
      const instanceHotel = await Hotel.findByPk(id, {
        attributes: ["id", "email"],
      });

      res.status(200).json(instanceHotel);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
