// messagerie.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Messagerie = sequelize.define('Messagerie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
 
});

module.exports = Messagerie;
