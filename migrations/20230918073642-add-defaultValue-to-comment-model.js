'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn('comments', 'media',
    {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    }
    )
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn('comments', 'media',
    {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    }
    )
  }
};
