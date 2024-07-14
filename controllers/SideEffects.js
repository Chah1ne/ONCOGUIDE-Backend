const cloudinary = require('cloudinary').v2;
const sequelize = require('sequelize');
const { Notification, DoctorPatient,User,SideEffects } = require('../models/models_chimio/index');


// Socket.io instance
let io;

// Function to set up Socket.io instance
const initSocketIo = (socketIoInstance) => {
  io = socketIoInstance;
};

const saveSideEffects = async (req, res) => {
  console.log('Data received from frontend:', req.body); // Log received data from frontend

  const {
    userId,
    selectedSymptom,
    selectedType,
    selectedSeverity,
    duration,
    additionalNotes,
    selectedSideEffects,
    imageUrl // Récupérez l'URL de l'image envoyée depuis le frontend
  } = req.body;

  // Create a new record for side effects
  try {
    await SideEffects.create({
      userId,
      selectedSymptom,
      selectedType,
      selectedSeverity,
      duration,
      additionalNotes,
      selectedSideEffects,
      imageUrl,
      status: 'pending' 
    });

    // Find the doctor(s) related to the patient
    const doctorPatientRecords = await DoctorPatient.findAll({
      where: {
        patientId: userId,
      },
      attributes: ['doctorId'],
    });

    // Send notification to each related doctor
    for (const record of doctorPatientRecords) {
      const doctorId = record.doctorId;
      const notificationMessage = `A new side effect has been reported by one of your patients. Please handle it.`;
      const newNotification = await Notification.create({
        userId: doctorId,
        message: notificationMessage,
        isRead: false,
      });

      // Emit the new notification to connected clients
      if (io) {
        io.emit('newNotification', newNotification);
      }
    }

    return res.status(201).json({ message: 'Effets secondaires enregistrés avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des effets secondaires:', error);
    return res.status(500).json({ message: 'Erreur lors de l\'enregistrement des effets secondaires.' });
  }
};






// Function to fetch all side effects related to a doctor
const getAllSideEffects = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Find all associations in the DoctorPatient table for the given doctorId
    const associations = await DoctorPatient.findAll({ where: { doctorId } });
    
    // Extract patientIds from associations
    const patientIds = associations.map(assoc => assoc.patientId);

    // Find side effects associated with the extracted patientIds
    const sideEffects = await SideEffects.findAll({
      where: {
        userId: patientIds, // Filter side effects by patientIds
        status: 'pending' // Additional filter by status: 'pending'
      },
      include: [{
        model: User, // Include the User model
        attributes: ['email'], // Specify the attributes to include
        as: 'User' // Correct alias for the User model
      }]
    });

    return res.status(200).json(sideEffects);
  } catch (error) {
    console.error('Error fetching side effects:', error);
    return res.status(500).json({ message: 'Error fetching side effects.' });
  }
};


const getAllSideEffectsHistory = async (req, res) => {
  const { doctorId } = req.params;

  try {
    // Find all associations in the DoctorPatient table for the given doctorId
    const associations = await DoctorPatient.findAll({ where: { doctorId } });
    
    // Extract patientIds from associations
    const patientIds = associations.map(assoc => assoc.patientId);

    // Find side effects associated with the extracted patientIds
    const sideEffects = await SideEffects.findAll({
      where: {
        userId: patientIds, // Filter side effects by patientIds
        status: 'done' // Additional filter by status: 'pending'
      },
      include: [{
        model: User, // Include the User model
        attributes: ['email'], // Specify the attributes to include
        as: 'User' // Correct alias for the User model
      }]
    });

    return res.status(200).json(sideEffects);
  } catch (error) {
    console.error('Error fetching side effects:', error);
    return res.status(500).json({ message: 'Error fetching side effects.' });
  }
};



// Function to mark a side effect as done

const markSideEffectAsDone = async (req, res) => {
  try {
    // If side effect is not found, return 404
    if (!req.sideEffect) {
      return res.status(404).json({ error: 'Side effect not found' });
    }

    // Extract the doctorResponse and doctorId from the request body
    const { doctorResponse, doctorId } = req.body;

    // Update the side effect's doctorResponse and doctorId
    req.sideEffect.doctorResponse = doctorResponse;
    req.sideEffect.doctorId = doctorId;

    // Update the status to 'done'
    req.sideEffect.status = 'done';

    // Save the changes to the side effect
    await req.sideEffect.save();

    // Send notification to the user related to the side effect
    const sideEffect = req.sideEffect;
    const userId = sideEffect.userId;
    const notificationMessage = `Your side effect "${sideEffect.selectedSymptom}" has been handled by your doctor.\nThe doctor's response: ${doctorResponse}`;
    const newNotification = await Notification.create({
      userId: userId,
      message: notificationMessage,
      isRead: false,
    });

    // Emit the new notification to connected clients
    if (io) {
      io.emit('newNotification', newNotification);
    }

    return res.status(200).json({ message: 'Side effect marked as done successfully' });
  } catch (error) {
    console.error('Error marking side effect as done:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Function to associate a doctor with a patient
const associateDoctorWithPatient = async (req, res) => {
  const { doctorId, patientId } = req.body;

  try {
    // Create a new association in the DoctorPatient table
    await DoctorPatient.create({ doctorId, patientId });
    
    return res.status(201).json({ message: 'Doctor associated with patient successfully.' });
  } catch (error) {
    console.error('Error associating doctor with patient:', error);
    return res.status(500).json({ message: 'Error associating doctor with patient.' });
  }
};



module.exports = {
  initSocketIo,
  saveSideEffects,
  getAllSideEffectsHistory,
  associateDoctorWithPatient,
  getAllSideEffects,
  markSideEffectAsDone,
};
