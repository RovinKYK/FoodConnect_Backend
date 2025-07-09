'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('food_items', 'food_name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Unnamed Food' // Temporary default for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('food_items', 'food_name');
  }
}; 