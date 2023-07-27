'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/reviews.json').map(e => {
      e.createdAt = e.updatedAt = new Date()
      return e
    })
    await queryInterface.bulkInsert('Reviews',data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews',null, {});
  }
};
