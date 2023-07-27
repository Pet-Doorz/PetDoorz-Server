'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let data = require('../data/customers.json').map(e => {
      e.createdAt = e.updatedAt = new Date()
      return e
    })
    await queryInterface.bulkInsert('Customers',data, {});  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Customers', null, {});
  }
};
