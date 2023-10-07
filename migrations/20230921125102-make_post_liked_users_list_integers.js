'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // Обновляем данные в новом столбце, преобразовав их из STRING[] в INTEGER[]
    await queryInterface.sequelize.query('UPDATE "posts" SET "tempLikedUsers" = "likedUsers"::INTEGER[]');

    // Удаляем старый столбец "likedUsers"
    await queryInterface.removeColumn('posts', 'likedUsers');

    // Переименовываем временный столбец в "likedUsers"
    await queryInterface.renameColumn('posts', 'tempLikedUsers', 'likedUsers');
  },

  async down(queryInterface, Sequelize) {
    // Восстанавливаем старый столбец "likedUsers" из временного
    await queryInterface.renameColumn('posts', 'likedUsers', 'tempLikedUsers');

    // Удаляем временный столбец "tempLikedUsers"
    await queryInterface.removeColumn('posts', 'tempLikedUsers');
  },
};
