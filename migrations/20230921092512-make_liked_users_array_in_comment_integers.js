'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем временный столбец
    await queryInterface.addColumn('comments', 'tempLikedUsers', {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER),
      defaultValue: [],
    });

    // Обновляем данные в новом столбце, преобразовав их из STRING[] в INTEGER[]
    await queryInterface.sequelize.query('UPDATE "comments" SET "tempLikedUsers" = "likedUsers"::INTEGER[]');

    // Удаляем старый столбец "likedUsers"
    await queryInterface.removeColumn('comments', 'likedUsers');

    // Переименовываем временный столбец в "likedUsers"
    await queryInterface.renameColumn('comments', 'tempLikedUsers', 'likedUsers');
  },

  async down(queryInterface, Sequelize) {
    // Восстанавливаем старый столбец "likedUsers" из временного
    await queryInterface.renameColumn('comments', 'likedUsers', 'tempLikedUsers');

    // Удаляем временный столбец "tempLikedUsers"
    await queryInterface.removeColumn('comments', 'tempLikedUsers');
  },
};
