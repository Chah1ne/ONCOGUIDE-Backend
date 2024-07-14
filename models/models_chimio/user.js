const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); 

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ref_ch: {
    type: DataTypes.INTEGER,
  },
  ref_r: {
    type: DataTypes.INTEGER,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true,
  }
},
{
  timestamps: true, 
});

module.exports = User;
