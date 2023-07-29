const { jwtSign } = require("../helpers/jwt");
const { decrypt } = require("../helpers/password");
const {
  Hotel,
  Room,
  Booking,
  Service,
  Review,
  Sequelize,
} = require("../models");
const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");

class HotelController {
  static async login(req, res, next) {
    try {
      if (!req.body) throw { name: "NoEmailPassword" };
      const { email, password } = req.body;

      const instanceHotel = await Hotel.findOne({
        where: {
          email,
        },
      });

      if (!instanceHotel) throw { name: `InvalidEmailPassword` };
      const isValid = bcrypt.compareSync(password, instanceHotel.password);

      if (!isValid) {
        throw { name: "InvalidEmailPassword" };
      } else {
        const payload = {
          id: instanceHotel.id,
          email: instanceHotel.email,
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

  static async findNearestHotel(req, res, next) {
    const distance = req.query.distance;
    const long = req.query.long;
    const lat = req.query.lat;
    try {
      if (!req.query.long || !req.query.lat || !req.query.distance) {
        const instanceHotels = await Hotel.findAll({
          include: [
            { model: Room, include: [{ model: Booking }] },
            { model: Service },
            { model: Review },
          ],
        });
        return res.status(200).json(instanceHotels);
      }

      const nearestHotels = await Hotel.findAll({
        where: Sequelize.where(
          Sequelize.fn(
            "ST_DWithin",
            Sequelize.col("location"),
            Sequelize.fn("ST_MakePoint", long, lat),
            distance,
            true
          ),
          true
        ),
        include: [
          { model: Room, include: [{ model: Booking }] },
          { model: Service },
          { model: Review },
        ],
      });
      res.status(200).json(nearestHotels);
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(req, res, next) {
    try {
      const { id } = req.params || 1;

      const instanceHotel = await Hotel.findByPk(id, {
        include: [
          {
            model: Room,
            include: [
              {
                model: Booking,
                where: {
                  status: { [Op.in]: ["booked", "process"] },
                  id: {
                    [Op.notIn]: Sequelize.literal(
                      '(SELECT "RoomId" FROM "Bookings")'
                    ),
                  },
                },
                required: false,
              },
            ],
          },
          { model: Service },
          { model: Review },
        ],
      });
      const countAvailableRoom = instanceHotel.Rooms.length;
      const detailed = instanceHotel.Rooms.map((e) => {
        return {
          name: e.name,
          price: e.price,
          total: e.capacity - e.Bookings.length,
          status: e.capacity - e.Bookings.length <= 0 ? "Full" : `Available`,
        };
      });
      console.log(countAvailableRoom, detailed);
      res.status(200).json(detailed);
    } catch (error) {
      next(error);
    }
  }
  //---------------------SERVICES----------------------
  static async getServices(req, res, next) {
    try {
      const { HotelId } = req.params

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: 'NOTFOUND' }

      const service = await Service.findAll({
        where: { HotelId }, attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })

      res.status(200).json(service)

    } catch (error) {
      next(error)
    }
  }

  static async addService(req, res, next) {
    try {
      const { HotelId } = req.params

      const { name, price } = req.body

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: "NOTFOUND" }

      const newService = await Service.create({ name, price, HotelId })

      res.status(201).json(newService)
    } catch (error) {
      next(error)
    }
  }

  static async updateService(req, res, next) {
    try {
      const { HotelId, id } = req.params

      const { name, price } = req.body

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: "NOTFOUND" }

      const service = await Service.findByPk(id)

      if (!service) throw { name: "NOTFOUND" }

      const newService = await Service.update({ name, price, HotelId }, { where: { id } })

      res.status(201).json({ message: `Service with id ${id} on HotelId ${HotelId} succefully updated!` })
    } catch (error) {
      next(error)
    }
  }

  static async deleteService(req, res, next) {
    try {
      const { HotelId, id } = req.params

      const hotel = await Hotel.findByPk(HotelId)

      if (!hotel) throw { name: "NOTFOUND" }

      const deletedService = await Service.destroy({ where: { id } })

      if (deletedService === 0) throw { name: "NOTFOUND" }

      res.status(200).json({ message: `Service with id ${id} from HotelId ${HotelId} deleted successfully!` })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = HotelController;
