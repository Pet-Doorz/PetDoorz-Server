'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsTo(models.Hotel)
    }
  }
  Image.init({
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
    modelName: 'Image',
  });
  return Image;
};