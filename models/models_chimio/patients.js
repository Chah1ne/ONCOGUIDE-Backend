const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  DMI: {
    type: DataTypes.INTEGER,
  },
  index: {
    type: DataTypes.INTEGER,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sexe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matrimonial: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  poids: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  taille: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  surfCorp: {
    type: DataTypes.FLOAT,
  },
  creatinine: {
    type: DataTypes.FLOAT,
  },
  formuleClair: {
    type: DataTypes.STRING,
  },
  clairance: {
    type: DataTypes.FLOAT,
  },
  commentaire: {
    type: DataTypes.TEXT,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Patient;
