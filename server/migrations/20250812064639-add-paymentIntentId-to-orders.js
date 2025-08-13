'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'payment_intent_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'status',
    });
  },

  // The 'down' function is executed when you need to undo the migration
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'payment_intent_id');
  },
};
