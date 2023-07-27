'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/services.json').map(e => {
      e.createdAt = e.updatedAt = new Date()
      return e
    })
    await queryInterface.bulkInsert('Services', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Services', null, {});
  }
};
