'use strict';

const { encrypt } = require('../helpers/password');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = require('../data/hotels.json').map(e => {
      e.password = encrypt(e.password)
      e.address = `Jl. Sample No. ${Math.ceil(Math.random() * 1000)}`
      e.phoneNumber = `0812${Math.ceil(Math.random() * 1000000)}`
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
