const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database'); 



const Notification = sequelize.define('Notifications', {
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
  message: {
    type: DataTypes.STRING,    
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
  },
},
{
  timestamps: true, 
});

module.exports = Notification;
