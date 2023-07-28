'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.Room)
      Booking.belongsTo(models.Customer)
      Booking.hasMany(models.BookingService)
    }
  }
  Booking.init({
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Customer ID is required"
        },
        notNull: {
          msg: "Customer ID is required"
        }
      }
    },
    RoomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Room ID is required"
        },
        notNull: {
          msg: "Room ID is required"
        }
      }
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Check-in date is required"
        },
        notNull: {
          msg: "Check-in date is required"
        }
      }
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Check-out date is required"
        },
        notNull: {
          msg: "Check-out date is required"
        }
      }
    },
    totalPet: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Total pet is required"
        },
        notNull: {
          msg: "Total pet is required"
        },
        min: {
          args: 1,
          msg: "Total pet must be greater than or equal to 1"
        }
      }
    },
    grandTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Grand total is required"
        },
        notNull: {
          msg: "Grand total is required"
        }
      }
    },
    petImage: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Pet image is required"
        },
        notNull: {
          msg: "Pet image is required"
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "booked",
      validate: {
        notEmpty: {
          msg: "Status is required"
        },
        notNull: {
          msg: "Status is required"
        },
        isIn: {
          args: [["booked", "process", "done"]],
          msg: "Invalid booking status"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};