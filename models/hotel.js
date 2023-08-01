"use strict";
const { Model } = require("sequelize");
const { encrypt } = require("../helpers/password");
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hotel.hasMany(models.Image)
      Hotel.hasMany(models.Service)
      Hotel.hasMany(models.Review)
      Hotel.hasMany(models.Room)
    }
  }
  Hotel.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Email must be unique"
        },
        validate: {
          notEmpty: {
            msg: "Email is required"
          },
          notNull: {
            msg: "Email is required"
          },
          isEmail: {
            args: true,
            msg: "Invalid email format"
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required"
          },
          notNull: {
            msg: "Password is required"
          }
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Hotel name is required"
          },
          notNull: {
            msg: "Hotel name is required"
          }
        }
      },
      location: {
        type: DataTypes.GEOMETRY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Location is required"
          },
          notNull: {
            msg: "Location is required"
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Address is required"
          },
          notNull: {
            msg: "Address is required"
          }
        }
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Phone number is required"
          },
          notNull: {
            msg: "Phone number is required"
          }
        }
      },
      balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          notEmpty: {
            msg: "Balance is required"
          },
          notNull: {
            msg: "Balance is required"
          },
          min: {
            args: 0,
            balance: "Balance must be greater than or equal to 0"
          }
        }
      },
      logoHotel: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "inactive",
        validate: {
          notEmpty: {
            msg: "Status is required"
          },
          notNull: {
            msg: "Status is required"
          },
          isIn: {
            args: [["inactive", "active"]],
            msg: "Invalid hotel status"
          }
        }
      },
    },
    {
      sequelize,
      modelName: "Hotel",
    }
  );

  Hotel.addHook("beforeCreate", async (hotel) => {
    hotel.status = "active";
    hotel.password = encrypt(hotel.password);
  });

  Hotel.addHook("beforeUpdate", async (hotel) => {
    hotel.status = "active";
    hotel.password = encrypt(hotel.password);
  });

  return Hotel;
};
