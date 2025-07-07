const configJson = require('./config.json');

module.exports = {
  development: configJson.development,
  test: configJson.test,
  production: configJson.production
};
