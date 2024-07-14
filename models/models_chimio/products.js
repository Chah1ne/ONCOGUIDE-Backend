const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); 

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_cure: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_molecule: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  validation: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  adjusted: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  liberer: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  terminer: {
    type: DataTypes.INTEGER,
    allowNull: false,
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


module.exports = Product;
