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
const { Op } = require("sequelize");
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
    //Rating
    //Tanggal
    const distance = req.query.distance;
    const long = req.query.long;
    const lat = req.query.lat;
    const tglMasuk = req.query.checkin; //DD/MM/YYYY
    const tglKeluar = req.query.checkout; //DD/MM/YYYY
    const totalPet = req.query.totalPet;
    const tglMasukDate = new Date(
      `${tglMasuk.split("/").reverse().join("-")}T00:00:00.000Z`
    );
    const tglKeluarDate = new Date(
      `${tglKeluar.split("/").reverse().join("-")}T00:00:00.000Z`
    );

    try {
      if (
        !req.query.long ||
        !req.query.lat ||
        !req.query.distance ||
        !req.query.checkin ||
        !req.query.checkout ||
        !req.query.totalPet
      ) {
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
        include: [
          {
            model: Room,
            attributes: ["HotelId", "capacity", "price"],
            include: [
              {
                model: Booking,
                attributes: ["RoomId", "checkIn", "checkOut", "status"],
              },
            ],
          },
          { model: Service },
          { model: Review },
        ],
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
      });

      const dataHotels = await Promise.all(
        nearestHotels.map(async (hotel) => {
          try {
            const Roomdata = await HotelController.getDetail(
              hotel.id,
              tglMasukDate,
              tglKeluarDate,
              totalPet
            );
            return {
              id: hotel.id,
              email: hotel.email,
              name: hotel.name,
              location: hotel.location,
              logoHotel: hotel.logoHotel,
              detailRoom: Roomdata,
            };
          } catch (error) {
            console.log(error);
          }
        })
      );

      res.status(200).json(dataHotels);
    } catch (error) {
      next(error);
    }
  }

  static async getDetail(id, checkinDate, checkoutDate, totalPet) {
    try {
      const instanceHotel = await Hotel.findByPk(id, {
        include: [
          {
            model: Room,
            include: [
              {
                model: Booking,
                where: {
                  [Op.or]: [
                    {
                      [Op.and]: [
                        {
                          checkIn: {
                            [Op.gte]: checkinDate,
                          },
                        },
                        {
                          checkIn: {
                            [Op.lte]: checkoutDate,
                          },
                        },
                      ],
                    },
                    {
                      [Op.and]: [
                        {
                          checkOut: {
                            [Op.gte]: checkinDate,
                          },
                        },
                        {
                          checkOut: {
                            [Op.lte]: checkoutDate,
                          },
                        },
                      ],
                    },
                  ],
                },
                required: false,
              },
            ],
          },
          { model: Service },
          { model: Review },
        ],
      });
      let currentTotalPet = 0;
      const detailed = instanceHotel.Rooms.map((e) => {
        e.Bookings.map((e) => {
          currentTotalPet += e.totalPet;
        });
        return {
          name: e.name,
          price: e.price,
          currentCapacity:
            e.capacity - e.Bookings.length - totalPet - currentTotalPet,
          bookings: e.Bookings,
        };
      });

      return detailed;
    } catch (error) {
      return error;
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const instanceHotel = await Hotel.findByPk(id);
      if (!instanceHotel) throw { name: "NOTFOUND" };
      instanceHotel.destroy();
      res.status(200).json({ message: "Success" });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { email, password, name, location, logoHotel } = req.body;
      const instanceHotel = await Hotel.findByPk(id);
      if (!instanceHotel) throw { name: "NOTFOUND" };
      instanceHotel.update({
        email,
        password,
        name,
        location,
        logoHotel,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HotelController;
