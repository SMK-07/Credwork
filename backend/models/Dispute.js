const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Dispute extends Model {
    static associate(models) {
      Dispute.belongsTo(models.Application, { foreignKey: 'application_id' });
      // To get the user who raised it
      Dispute.belongsTo(models.User, { foreignKey: 'raised_by' });
    }
  }

  Dispute.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    application_id: {
      type: DataTypes.UUID,
    },
    raised_by: {
      type: DataTypes.UUID,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED'),
      defaultValue: 'OPEN',
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Dispute',
    tableName: 'disputes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Dispute;
};
