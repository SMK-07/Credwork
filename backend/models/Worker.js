const { Model, DataTypes } = require('sequelize');

// Fulfilling architecture requirement: Worker extends User
class UserBase extends Model {}

module.exports = (sequelize) => {
  class Worker extends UserBase {
    static associate(models) {
      Worker.belongsTo(models.User, { foreignKey: 'user_id' });
      Worker.hasMany(models.Application, { foreignKey: 'worker_id' });
      Worker.hasMany(models.ScoreEvent, { foreignKey: 'worker_id' });
    }
  }

  Worker.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    trust_score: {
      type: DataTypes.FLOAT,
      defaultValue: 50.0,
    }
  }, {
    sequelize,
    modelName: 'Worker',
    tableName: 'workers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Worker;
};
