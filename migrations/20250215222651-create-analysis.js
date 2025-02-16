// migrations/XXXXXXXXXXXXXX-create-analysis.js
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('analysis', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      year: Sequelize.INTEGER,
      semester: Sequelize.INTEGER,
      subject: Sequelize.STRING,
      id_group: Sequelize.STRING,
      id_department: Sequelize.STRING,
      count_stud: Sequelize.INTEGER,
      count5: Sequelize.INTEGER,
      count4: Sequelize.INTEGER,
      count3: Sequelize.INTEGER,
      count2: Sequelize.INTEGER,
      count_passed: Sequelize.INTEGER,
      count_released: Sequelize.INTEGER,
      count_not_cert: Sequelize.INTEGER,
      count_acad_leave: Sequelize.INTEGER,
      count_expelled: Sequelize.INTEGER,
      quality: Sequelize.DECIMAL(6, 2),
      overall: Sequelize.FLOAT,
      average: Sequelize.FLOAT,
      created_at: {
        type: Sequelize.DATE(3),
        defaultValue: Sequelize.NOW
      },
      updated_at: Sequelize.DATE(3),
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('analysis');
  }
};