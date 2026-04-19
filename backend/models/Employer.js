const { Model, DataTypes } = require('sequelize');

class UserBase extends Model {}

module.exports = (sequelize) => {
  class Employer extends UserBase {
    static associate(models) {
      Employer.belongsTo(models.User, { foreignKey: 'user_id' });
      Employer.hasMany(models.Job, { foreignKey: 'employer_id' });
    }
  }

  Employer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    org_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'Employer',
    tableName: 'employers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Employer;
};
