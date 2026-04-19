const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.Worker, { foreignKey: 'worker_id' });
      Application.belongsTo(models.Job, { foreignKey: 'job_id' });
      Application.hasMany(models.ScoreEvent, { foreignKey: 'application_id' });
      Application.hasOne(models.Dispute, { foreignKey: 'application_id' });
    }
  }

  Application.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    worker_id: {
      type: DataTypes.UUID,
    },
    job_id: {
      type: DataTypes.UUID,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'OUTCOME_CONFIRMED', 'GHOSTED'),
      defaultValue: 'PENDING',
    },
    outcome: {
      type: DataTypes.ENUM('CONFIRMED', 'REJECTED', 'GHOST'),
      allowNull: true,
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'applications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Application;
};
