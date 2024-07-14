const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); 

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_patient: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_parent: {
    type: DataTypes.INTEGER,
  },
  prescripteur: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nbrCures: {
    type: DataTypes.INTEGER,
  },
  essaiClin: {
    type: DataTypes.BOOLEAN,
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


module.exports = Prescription;
