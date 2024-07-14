const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DoctorPatient = sequelize.define('DoctorPatient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = DoctorPatient;
