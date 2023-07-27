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
          tableName: "Customers"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      RoomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          tableName: "Rooms"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      checkIn: {
        type: Sequelize.DATE,
        allowNull: false
      },
      checkOut: {
        type: Sequelize.DATE
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
        type: Sequelize.STRING,
        allowNull: false
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