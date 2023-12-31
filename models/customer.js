'use strict';
const {
  Model
} = require('sequelize');
const { encrypt } = require('../helpers/password');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer.hasMany(models.Booking)
      Customer.hasMany(models.Review)
    }
  }
  Customer.init({
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
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Full name is required"
        },
        notNull: {
          msg: "Full name is required"
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
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Customer',
  });

  Customer.addHook("beforeCreate", async (customer) => {
    customer.password = encrypt(customer.password);
  });

  // Customer.addHook("beforeUpdate", async (customer) => {
  //   customer.password = encrypt(customer.password);
  // });

  return Customer;
};