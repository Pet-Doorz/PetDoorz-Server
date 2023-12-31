const { jwtSign } = require("../helpers/jwt");
const { decrypt, encrypt } = require("../helpers/password");
const {
  Hotel,
  Room,
  Booking,
  Service,
  Review,
  Image,
  Sequelize,
  Customer,
  BookingService,
  sequelize,
} = require("../models");
const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");
const calculateDistance = require("../helpers/calculateDistance");
const getChatHistory = require("../helpers/thirdPartyRequest");
const uuid = require("uuid");
const crypto = require("crypto");

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
    const transaction = await sequelize.transaction();
    try {
      const {
        email,
        password,
        name,
        location,
        logoHotel,
        address,
        phoneNumber,
        description,
        images,
      } = req.body;

      const geoLocation = Sequelize.fn("ST_GeomFromText", `POINT(${location})`);

      const newHotel = await Hotel.create(
        {
          email,
          password,
          name,
          location: geoLocation,
          logoHotel,
          address,
          phoneNumber,
          description,
        },
        { transaction }
      );

      const imagesArr = images.map((e) => {
        return {
          imageUrl: e,
          HotelId: newHotel.id,
        };
      });

      await Image.bulkCreate(imagesArr, { transaction });
      await transaction.commit();

      res.status(201).json({
        status: "Created",
        message: "New Hotel has been added",
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async hotelByAuth(req, res, next) {
    try {
      let { id } = req.hotel;

      const data = await Hotel.findByPk(id, {
        include: [
          Service,
          Review,
          {
            model: Room,
            include: {
              model: Booking,
              include: [
                {
                  model: Customer,
                  attributes: ["id", "fullName", "email"],
                },
                {
                  model: BookingService,
                  include: Service,
                },
              ],
            },
          },
          Image,
        ],
        attributes: { exclude: ["Password"] },
      });
      if (!data) throw { name: "NOTFOUND" };

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async hotelById(req, res, next) {
    try {
      let { id } = req.params;

      const data = await Hotel.findByPk(id, {
        include: [
          Service,
          Review,
          {
            model: Room,
            include: Booking,
          },
          Image,
        ],
        attributes: { exclude: ["Password"] },
      });
      if (!data) throw { name: "NOTFOUND" };

      res.status(200).json(data);
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
    let tglMasukDate;
    if (tglMasuk) {
      tglMasukDate = new Date(
        `${tglMasuk.split("/").reverse().join("-")}T00:00:00.000Z`
      );
    }
    let tglKeluarDate;
    if (tglKeluar) {
      tglKeluarDate = new Date(
        `${tglKeluar.split("/").reverse().join("-")}T00:00:00.000Z`
      );
    }

    try {
      console.log(req.query);
      if (
        !req.query.long ||
        !req.query.lat ||
        !req.query.distance ||
        !req.query.checkin ||
        !req.query.checkout ||
        !req.query.totalPet ||
        !req.query
      ) {
        const instanceHotels = await Hotel.findAll({
          where: {
            status: "active",
          },
          include: [
            { model: Room, include: [{ model: Booking }] },
            { model: Service },
            {
              model: Review,
              include: {
                model: Customer,
                attributes: ["fullName"],
              },
            },
            { model: Image },
          ],
          attributes: { exclude: ["password"] },
        });
        return res.status(200).json(instanceHotels);
      }
      const tglMasukDate = new Date(
        `${tglMasuk.split("/").reverse().join("-")}T00:00:00.000Z`
      );
      const tglKeluarDate = new Date(
        `${tglKeluar.split("/").reverse().join("-")}T00:00:00.000Z`
      );
      const nearestHotels = await Hotel.findAll({
        include: [
          {
            model: Room,
            attributes: ["HotelId", "capacity", "price", "description"],
            include: [
              {
                model: Booking,
                attributes: ["RoomId", "checkIn", "checkOut", "status"],
              },
            ],
          },
          { model: Service },
          {
            model: Review,
            include: [
              {
                model: Customer,
                attributes: ["fullName"],
              },
            ],
          },
          { model: Image },
        ],
        attributes: { exclude: ["password"] },
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
              status: hotel.status,
              logoHotel: hotel.logoHotel,
              description: hotel.description,
              services: hotel.Services,
              reviews: hotel.Reviews,
              images: hotel.Images,
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
          hotel.detailRoom.every((room) => room.currentCapacity > 0) &&
          hotel.status === "active"
        );
      });

      const sortByDistance = (hotel) => {
        return hotel.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );
      };

      const sortedHotels = sortByDistance(hotelsWithAvailableRooms);
      res.status(200).json(sortedHotels);
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
          { model: Image },
        ],
      });
      let currentTotalPet = 0;
      const detailed = instanceHotel.Rooms.map((e) => {
        e.Bookings.map((e) => {
          currentTotalPet += e.totalPet;
        });
        return {
          id: e.id,
          name: e.name,
          price: e.price,
          currentCapacity:
            e.capacity - e.Bookings.length - totalPet - currentTotalPet,
          bookings: e.Bookings,
          description: e.description,
          imageUrl: e.imageUrl,
        };
      });
      return detailed;
    } catch (error) {
      return error;
    }
  }

  static async changeStatus(req, res, next) {
    try {
      const { id } = req.hotel;

      const data = await Hotel.findByPk(id);
      if (!data) throw { name: "NOTFOUND" };

      let newStatus = "";
      if (data.status === "active") {
        newStatus = "inactive";
      } else {
        newStatus = "active";
      }
      await data.update({ status: newStatus }, { hooks: false });

      res
        .status(200)
        .json({ message: `Hotel #${id} status updated into '${newStatus}'` });
    } catch (error) {
      next(error);
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
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.hotel;
      const {
        email,
        password,
        name,
        location,
        logoHotel,
        address,
        phoneNumber,
        description,
        images,
      } = req.body;

      let geoLocation;
      if (location) {
        geoLocation = Sequelize.fn("ST_GeomFromText", `POINT(${location})`);
      }
      const instanceHotel = await Hotel.findByPk(id);
      await instanceHotel.update(
        {
          email,
          password: encrypt(password),
          name,
          location: geoLocation,
          logoHotel,
          address,
          phoneNumber,
          description,
        },
        { transaction }
      );

      await Image.destroy({ where: { HotelId: id }, transaction });
      const imagesArr = images.map((e) => {
        return {
          imageUrl: e,
          HotelId: id,
        };
      });
      await Image.bulkCreate(imagesArr, { transaction });
      await transaction.commit();

      res.status(200).json({ message: `Hotel #${instanceHotel.id} updated` });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
  //---------------------SERVICES----------------------
  static async getServices(req, res, next) {
    try {
      let { id: HotelId } = req.hotel;

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
      let { id: HotelId } = req.hotel;

      const { name, price } = req.body;

      const newService = await Service.create({ name, price, HotelId });

      res.status(201).json(newService);
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req, res, next) {
    try {
      const { id } = req.params;
      let { id: HotelId } = req.hotel;

      const { name, price } = req.body;

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
      const { id } = req.params;
      let { id: HotelId } = req.hotel;

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
      let { id: HotelId } = req.hotel;

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
      let { id: HotelId } = req.hotel;

      const { name, capacity, price, description, imageUrl } = req.body;

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
      const { id } = req.params;
      let { id: HotelId } = req.hotel;

      const { name, capacity, price, description, imageUrl } = req.body;

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
      const { id } = req.params;
      let { id: HotelId } = req.hotel;

      const deletedRoom = await Room.destroy({ where: { id } });

      if (deletedRoom === 0) throw { name: "NOTFOUND" };

      res.status(200).json({
        message: `Room with id ${id} from HotelId ${HotelId} successfully deleted!`,
      });
    } catch (error) {
      next(error);
    }
  }

  // -------------- CHAT -----------------
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
}

module.exports = HotelController;
