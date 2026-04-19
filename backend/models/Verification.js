const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Verification extends Model {
    static associate(models) {
      Verification.belongsTo(models.Worker, { foreignKey: 'worker_id' });
    }
  }

  Verification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    worker_id: {
      type: DataTypes.UUID,
    },
    doc_type: {
      type: DataTypes.STRING,
    },
    doc_path: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Verification;
};
