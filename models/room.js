'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Room.belongsTo(models.Hotel)
      Room.hasMany(models.Booking)
    }
  }
  Room.init({
    HotelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Hotel ID is required"
        },
        notNull: {
          msg: "Hotel ID is required"
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Room name is required"
        },
        notNull: {
          msg: "Room name is required"
        }
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Capacity is required"
        },
        notNull: {
          msg: "Capacity is required"
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Price is required"
        },
        notNull: {
          msg: "Price is required"
        },
        min: {
          args: 0-Number.MIN_VALUE,
          msg: "Price must be greater than or equal to 0"
        }
      }
    },
    description: DataTypes.TEXT,
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Image is required"
        },
        notNull: {
          msg: "Image is required"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Room',
  });
  return Room;
};