'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user_infos','profileHeaderPicturee', {
      type: DataTypes.STRING,
      allowNull: true, 
      defaultValue: "defaultProfileHeader.png"
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_infos','profileHeaderPicturee')
  }
};
