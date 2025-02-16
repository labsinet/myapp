// models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      department: DataTypes.STRING,
      category: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'  // змінено
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'  // змінено
      }
    }, {
      tableName: 'user'
    });
  
    User.associate = function(models) {
      User.hasMany(models.Analysis, { foreignKey: 'id_user'  });
    };
  
    return User;
  };