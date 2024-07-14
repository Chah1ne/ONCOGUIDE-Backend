const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Education = sequelize.define('Education', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  iconImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    allowNull: false,
    type: DataTypes.TEXT, // Store as TEXT to accommodate the serialized array
  },
  video: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Education;
