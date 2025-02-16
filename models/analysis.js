// models/analysis.js
module.exports = (sequelize, DataTypes) => {
    const Analysis = sequelize.define('Analysis', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      year: DataTypes.INTEGER,
      semester: DataTypes.INTEGER,
      subject: DataTypes.STRING,
      id_group: DataTypes.STRING,
      id_department: DataTypes.STRING,
      count_stud: DataTypes.INTEGER,
      count5: DataTypes.INTEGER,
      count4: DataTypes.INTEGER,
      count3: DataTypes.INTEGER,
      count2: DataTypes.INTEGER,
      count_passed: DataTypes.INTEGER,
      count_released: DataTypes.INTEGER,
      count_not_cert: DataTypes.INTEGER,
      count_acad_leave: DataTypes.INTEGER,
      count_expelled: DataTypes.INTEGER,
      quality: DataTypes.DECIMAL(6, 2),
      overall: DataTypes.FLOAT,
      average: DataTypes.FLOAT,
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'  // змінено
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'  // змінено
      },
      id_user: {
        type: DataTypes.INTEGER,
        references: {
          model: 'user',
          key: 'id'
        }
      }
    }, {
      tableName: 'analysis'
    });
  
    Analysis.associate = function(models) {
      Analysis.belongsTo(models.User, { foreignKey: 'id_user' });
    };
  
    return Analysis;
  };