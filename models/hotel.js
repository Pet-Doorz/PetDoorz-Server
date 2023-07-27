'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Hotel.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    location: DataTypes.GEOMETRY,
    balance: DataTypes.INTEGER,
    logoHotel: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Hotel',
  });
  return Hotel;
};