'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Reviews', 'bookingId', Sequelize.INTEGER);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reviews', 'bookingId')
  }
};
