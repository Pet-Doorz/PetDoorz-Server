'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Customers"
          }
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      RoomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Rooms"
          }
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      checkIn: {
        type: Sequelize.DATE,
        allowNull: false
      },
      checkOut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      totalPet: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      grandTotal: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      petImage: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "booked"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};