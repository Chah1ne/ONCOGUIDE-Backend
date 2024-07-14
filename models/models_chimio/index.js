const Cure = require('./cures');
const Patient = require('./patients');
const Prescription = require('./prescriptions');
const Product = require('./products');
const User = require('./user');
const Notification = require('./notifs');
const Messagerie = require('./messagerie');
const SideEffects = require('./SideEffects');
const DoctorPatient = require('./DoctorPatient'); // Import the DoctorPatient model
const Education = require('./education');
const CardAssignments = require('./CardAssignments');



Prescription.belongsTo(Patient, { foreignKey: 'id_patient' });
Cure.belongsTo(Prescription, { foreignKey: 'id_prescription' });
Notification.belongsTo(User, { foreignKey: 'userId' });
User.belongsTo(Patient, { foreignKey: 'ref_ch' });
Patient.hasOne(User, { foreignKey: 'ref_ch' });
Patient.hasMany(Prescription, { foreignKey: 'id_patient' });
Prescription.hasMany(Cure, { foreignKey: 'id_prescription' });
Cure.hasOne(Product, { foreignKey: 'id_cure' });
Product.belongsTo(Cure, { foreignKey: 'id_cure' });
Messagerie.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Messagerie.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });
SideEffects.belongsTo(User, { foreignKey: 'userId' });
DoctorPatient.belongsTo(User, { foreignKey: 'doctorId' }); // Define association to User for doctorId
DoctorPatient.belongsTo(User, { foreignKey: 'patientId' }); // Define association to Patient for patientId
DoctorPatient.belongsTo(SideEffects, { foreignKey: 'doctorId' }); // Define association to Patient for patientId

CardAssignments.belongsTo(User, { foreignKey: 'idUser', onDelete: 'CASCADE' });
CardAssignments.belongsTo(Education, { foreignKey: 'cardId', onDelete: 'CASCADE' });



module.exports = {
  User,
  Patient,
  Prescription,
  Product,
  Cure,
  Notification,
  Messagerie,
  SideEffects,
  DoctorPatient,
  Education,
  CardAssignments, 
};
