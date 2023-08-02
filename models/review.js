'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.Hotel)
      Review.belongsTo(models.Customer)
    }
  }
  Review.init({
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Rating is required"
        },
        notNull: {
          msg: "Rating is required"
        }
      }
    },
    comment: {
      type: DataTypes.TEXT
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
    },
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
    bookingId: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};