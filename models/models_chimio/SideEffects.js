const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const SideEffects = sequelize.define('SideEffects', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  selectedSymptom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  selectedType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  selectedSeverity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
  },
  additionalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  selectedSideEffects: {
    type: DataTypes.TEXT, // Change data type to TEXT
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  doctorResponse: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  doctorId: {
    type: DataTypes.INTEGER, 
    allowNull: true,
  },
});

module.exports = SideEffects;
