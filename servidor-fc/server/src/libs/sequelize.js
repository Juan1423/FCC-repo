const { Sequelize } = require('sequelize');
const  { config } = require('../config/db');
const setupModels = require('../models/index.models');
  
const sequelize = new Sequelize(
    config.dbName, 
    config.dbUser, 
    config.dbPassword, 
    {
      host: config.dbHost,
      dialect: 'postgres',
      port: config.dbPort, 
      logging: false,
    }
  );

  sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  setupModels(sequelize);
  sequelize.sync(); /*Sincronizar model EDR */ 

module.exports = sequelize;