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
const calculateDistance = require("../helpers/calculateDistance");
const getChatHistory = require("../helpers/thirdPartyRequest");

class HotelController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email) throw { name: "NullEmail" };
      if (!password) throw { name: "NullPassword" };

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
            const perDistance = await calculateDistance(
              hotel.location.coordinates,
              [+req.query.long, +req.query.lat]
            );
            return {
              id: hotel.id,
              email: hotel.email,
              name: hotel.name,
              location: hotel.location,
              logoHotel: hotel.logoHotel,
              distance: perDistance,
              detailRoom: Roomdata,
            };
          } catch (error) {
            console.log(error);
          }
        })
      );

      const hotelsWithAvailableRooms = dataHotels.filter((hotel) => {
        return (
          hotel.detailRoom.length > 0 &&
          hotel.detailRoom.every(
            (room) => room.currentCapacity >= 0 && room.currentCapacity > 0
          )
        );
      });

      res.status(200).json(hotelsWithAvailableRooms);
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
      await instanceHotel.update({
        email,
        password,
        name,
        location,
        logoHotel,
      });
      res.status(200).json({ message: `Hotel #${instanceHotel.id} updated` });
    } catch (error) {
      next(error);
    }
  }
  //---------------------SERVICES----------------------
  static async getServices(req, res, next) {
    try {
      const { HotelId } = req.params;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const service = await Service.findAll({
        where: { HotelId },
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      res.status(200).json(service);
    } catch (error) {
      next(error);
    }
  }

  static async addService(req, res, next) {
    try {
      const { HotelId } = req.params;

      const { name, price } = req.body;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const newService = await Service.create({ name, price, HotelId });

      res.status(201).json(newService);
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req, res, next) {
    try {
      const { HotelId, id } = req.params;

      const { name, price } = req.body;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const service = await Service.findByPk(id);

      if (!service) throw { name: "NOTFOUND" };

      const newService = await Service.update(
        { name, price, HotelId },
        { where: { id } }
      );

      res.status(201).json({
        message: `Service with id ${id} on HotelId ${HotelId} succefully updated!`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteService(req, res, next) {
    try {
      const { HotelId, id } = req.params;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const deletedService = await Service.destroy({ where: { id } });

      if (deletedService === 0) throw { name: "NOTFOUND" };

      res.status(200).json({
        message: `Service with id ${id} from HotelId ${HotelId} deleted successfully!`,
      });
    } catch (error) {
      next(error);
    }
  }

  //---------------------ROOM-------------------------
  static async getRooms(req, res, next) {
    try {
      const { HotelId } = req.params;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const rooms = await Room.findAll({
        where: { HotelId },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      res.status(200).json(rooms);
    } catch (error) {
      next(error);
    }
  }

  static async addRoom(req, res, next) {
    try {
      const { HotelId } = req.params;

      const { name, capacity, price, description, imageUrl } = req.body;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const newRoom = await Room.create({
        name,
        capacity,
        price,
        description,
        imageUrl,
        HotelId,
      });

      res.status(201).json(newRoom);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoom(req, res, next) {
    try {
      const { HotelId, id } = req.params;

      const { name, capacity, price, description, imageUrl } = req.body;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const room = await Room.findByPk(id);

      if (!room) throw { name: "NOTFOUND" };

      const updatedRoom = await Room.update(
        { name, capacity, price, description, imageUrl, HotelId },
        { where: { id } }
      );

      res.status(201).json({
        message: `Room with id ${id} from HotelId ${HotelId} updated successfully!`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoom(req, res, next) {
    try {
      const { HotelId, id } = req.params;

      const hotel = await Hotel.findByPk(HotelId);

      if (!hotel) throw { name: "NOTFOUND" };

      const deletedRoom = await Room.destroy({ where: { id } });

      if (deletedRoom === 0) throw { name: "NOTFOUND" };

      res.status(200).json({
        message: `Room with id ${id} from HotelId ${HotelId} successfully deleted!`,
      });
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
}

module.exports = HotelController;
