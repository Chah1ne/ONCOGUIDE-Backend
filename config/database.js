const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, 'root', '', {
  host: 'localhost', 
  dialect: 'mysql',
  database: 'asqii',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = sequelize;
