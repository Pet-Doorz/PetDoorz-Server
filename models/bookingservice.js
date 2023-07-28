'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BookingService.belongsTo(models.Booking)
      BookingService.belongsTo(models.Service)
    }
  }
  BookingService.init({
    BookingId: {
      type: DataTypes.INTEGER,
    },
    ServiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Service ID is required"
        },
        notNull: {
          msg: "Service ID is required"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'BookingService',
  });
  return BookingService;
};