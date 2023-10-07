'use strict';
const { DataTypes } = require('sequelize');
  

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn('comments', 'replyingToCommentId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn('comments', 'replyingToCommentId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  }
};
