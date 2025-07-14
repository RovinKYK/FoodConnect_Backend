const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const configJson = require('../../config/config.json');
const env = process.env.NODE_ENV || 'development';
const config = configJson[env];
const db = {};

const getEnvOrConfig = (envVar, configKey) => process.env[envVar] || config[configKey];

let sequelize;
if (
  process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_HOSTNAME &&
  process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_PORT &&
  process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_USERNAME &&
  process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_PASSWORD &&
  process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_DATABASENAME
) {
  // Use Choreo-provided environment variables
  sequelize = new Sequelize(
    process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_DATABASENAME,
    process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_USERNAME,
    process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_PASSWORD,
    {
      host: process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_HOSTNAME,
      port: process.env.CHOREO_CONNECTION_BACKEND_DEFAULTDB_PORT,
      dialect: 'postgres',
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true
        }
      },
      logging: false
    }
  );
} else {
  // Fallback to config.json
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 