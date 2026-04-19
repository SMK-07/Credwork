const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Worker, { foreignKey: 'user_id' });
      User.hasOne(models.Employer, { foreignKey: 'user_id' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('WORKER', 'EMPLOYER', 'ADMIN'),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
