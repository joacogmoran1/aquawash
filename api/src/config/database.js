const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST || 'localhost',
		port: process.env.DB_PORT || 5432,
		dialect: 'postgres',
		logging: process.env.NODE_ENV === 'development' ? console.log : false,
		define: {
			underscored: true,
			freezeTableName: false,
		},
		pool: {
			max: 10,
			min: 2,
			acquire: 30_000,
			idle: 10_000,
		},
		retry: {
			max: 3,
			backoffBase: 300,
			backoffExponent: 1.5,
			match: [
				/SequelizeConnectionError/,
				/SequelizeConnectionRefusedError/,
				/SequelizeConnectionTimedOutError/,
				/SequelizeHostNotFoundError/,
				/SequelizeHostNotReachableError/,
				/ECONNRESET/,
				/ECONNREFUSED/,
				/ETIMEDOUT/,
			],
			timeout: 60_000,
		},
	}
);

module.exports = sequelize;