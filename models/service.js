'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Service.belongsTo(models.Hotel)
      Service.hasMany(models.BookingService)
    }
  }
  Service.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Service name is required"
        },
        notNull: {
          msg: "Service name is required"
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
          args: 0,
          msg: "Price must be greater than or equal to 0"
        }
      }
    },
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
    }
  }, {
    sequelize,
    modelName: 'Service',
  });
  return Service;
};