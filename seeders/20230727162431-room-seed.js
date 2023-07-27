'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/rooms.json').map(e => {
      e.createdAt = e.updatedAt = new Date()
      return e
    })
    await queryInterface.bulkInsert('Rooms', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rooms', null, {});
  }
};
