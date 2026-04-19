const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.Employer, { foreignKey: 'employer_id' });
      Job.hasMany(models.Application, { foreignKey: 'job_id' });
    }
  }

  Job.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    employer_id: {
      type: DataTypes.UUID,
    },
    title: {
      type: DataTypes.STRING,
    },
    required_skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'OPEN',
    }
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Job;
};
