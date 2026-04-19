'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
      },
      role: {
        type: Sequelize.ENUM('WORKER', 'EMPLOYER', 'ADMIN'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('workers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      skills: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      trust_score: {
        type: Sequelize.FLOAT,
        defaultValue: 50.0,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('employers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      org_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('verifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      worker_id: {
        type: Sequelize.UUID,
        references: { model: 'workers', key: 'id' },
      },
      doc_type: {
        type: Sequelize.STRING,
      },
      doc_path: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      employer_id: {
        type: Sequelize.UUID,
        references: { model: 'employers', key: 'id' },
      },
      title: {
        type: Sequelize.STRING,
      },
      required_skills: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'OPEN',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      worker_id: {
        type: Sequelize.UUID,
        references: { model: 'workers', key: 'id' },
      },
      job_id: {
        type: Sequelize.UUID,
        references: { model: 'jobs', key: 'id' },
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'OUTCOME_CONFIRMED', 'GHOSTED'),
        defaultValue: 'PENDING',
      },
      outcome: {
        type: Sequelize.ENUM('CONFIRMED', 'REJECTED', 'GHOST'),
        allowNull: true,
      },
      applied_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('score_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      worker_id: {
        type: Sequelize.UUID,
        references: { model: 'workers', key: 'id' },
      },
      application_id: {
        type: Sequelize.UUID,
        references: { model: 'applications', key: 'id' },
      },
      event_type: {
        type: Sequelize.STRING,
      },
      delta: {
        type: Sequelize.FLOAT,
      },
      reason: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });

    await queryInterface.createTable('disputes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      application_id: {
        type: Sequelize.UUID,
        references: { model: 'applications', key: 'id' },
      },
      raised_by: {
        type: Sequelize.UUID,
      },
      description: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED'),
        defaultValue: 'OPEN',
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('disputes');
    await queryInterface.dropTable('score_events');
    await queryInterface.dropTable('applications');
    await queryInterface.dropTable('jobs');
    await queryInterface.dropTable('verifications');
    await queryInterface.dropTable('employers');
    await queryInterface.dropTable('workers');
    await queryInterface.dropTable('users');
  }
};
