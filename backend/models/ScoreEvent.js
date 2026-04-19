const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ScoreEvent extends Model {
    static associate(models) {
      ScoreEvent.belongsTo(models.Worker, { foreignKey: 'worker_id' });
      ScoreEvent.belongsTo(models.Application, { foreignKey: 'application_id' });
    }
  }

  ScoreEvent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    worker_id: {
      type: DataTypes.UUID,
    },
    application_id: {
      type: DataTypes.UUID,
    },
    event_type: {
      type: DataTypes.STRING,
    },
    delta: {
      type: DataTypes.FLOAT,
    },
    reason: {
      type: DataTypes.TEXT,
    }
  }, {
    sequelize,
    modelName: 'ScoreEvent',
    tableName: 'score_events',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ScoreEvent;
};
