'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = require('../data/hotels.json').map(e => {
      e.createdAt = e.updatedAt = new Date()
      e.location = Sequelize.fn(
        'ST_GeomFromText',
        'POINT('+e.location.coordinates[0].split(', ').join(' ')+')'
      )
      return e
    })
    await queryInterface.bulkInsert('Hotels', data)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Hotels', null, {});
  }
};
