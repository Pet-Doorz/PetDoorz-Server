'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TopUp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TopUp.init({
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Order ID is required"
        },
        notNull: {
          msg: "Order ID is required"
        }
      }
    },
    CustomerId: DataTypes.INTEGER,
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Total amount is required"
        },
        notNull: {
          msg: "Total amount is required"
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incomplete",
      validate: {
        notEmpty: {
          msg: "Status is required"
        },
        notNull: {
          msg: "Status is required"
        },
        isIn: {
          args: [["incomplete", "completed"]],
          msg: "Invalid top up status"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'TopUp',
  });
  return TopUp;
};