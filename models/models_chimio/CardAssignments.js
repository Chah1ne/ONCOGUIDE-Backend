const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CardAssignment = sequelize.define('CardAssignment', {
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CardAssignment;
