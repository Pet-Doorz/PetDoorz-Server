'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = require('../data/bookings.json').map(e => {
      e.checkIn = new Date()

      const today = new Date();
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1)
      e.checkOut = tomorrow

      e.createdAt = e.updatedAt = new Date()
      return e
    })
    await queryInterface.bulkInsert('Bookings', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
