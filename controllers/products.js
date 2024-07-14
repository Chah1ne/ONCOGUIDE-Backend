const { Product, Cure, Prescription, Patient, User } = require('../models/models_chimio/index');
const { Op, fn, col } = require('sequelize'); // Assurez-vous d'importer fn et col de sequelize


// afficher les seance de chaque patinet depend du user avec le ref ch pour lié au patient concerné 
//-----------------------------------------------------------------------------------------------

const getProductsByPatientId = async (req, res) => {
  try {
    // Get the user ID from the params
    const userId = req.params.userId;

    // Find the corresponding ref_ch using the user ID
    const user = await User.findByPk(userId);

    if (!user || !user.ref_ch) {
      return res.status(404).json({ error: 'User not found or ref_ch not set' });
    }

    const ref_ch = user.ref_ch;

    // Now you have the ref_ch, find the patient ID
    const patient = await Patient.findByPk(ref_ch);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patient.id;

    // Utilize the method findAll with the options of inclusion to retrieve the products of the patient
    const patientProducts = await Product.findAll({
      include: [
        {
          model: Cure,
          include: [
            {
              model: Prescription,
              where: { id_patient: patientId },
              attributes: [], // Exclude Prescription attributes
              include: [
                {
                  model: Patient,
                  where: { id: patientId },
                  attributes: [], // Exclude Patient attributes
                },
              ],
            },
          ],
          attributes: [], // Exclude Cure attributes
        },
      ],
      where: { '$Cure.Prescription.Patient.id$': patientId }, // Restrict the query to the specified patient
    });

    if (patientProducts.length === 0) {
      // If no products are found for the given patient, return an error
      res.status(404).json({ error: 'Products not found for the specified patient' });
    } else {
      res.status(200).json(patientProducts);
    }
  } catch (error) {
    console.error('Error fetching Products by patient ID:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};




// afficher comme toast la seance prochain pour informé le patinet depend du user avec le ref ch pour lié au patient concerné 
//-----------------------------------------------------------------------------------------------


const getNextSessionByPatientId = async (req, res) => {
  try {
    // Get the user ID from the params
    const userId = req.params.userId;

    // Find the corresponding ref_ch using the user ID
    const user = await User.findByPk(userId);

    if (!user || !user.ref_ch) {
      return res.status(404).json({ error: 'User not found or ref_ch not set' });
    }

    const ref_ch = user.ref_ch;

    // Now you have the ref_ch, find the patient ID
    const patient = await Patient.findByPk(ref_ch);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientId = patient.id;

    // Utilize the method findOne with the options of inclusion to retrieve the next session product of the patient
    const nextSessionProduct = await Product.findOne({
      include: [
        {
          model: Cure,
          include: [
            {
              model: Prescription,
              where: { id_patient: patientId },
              attributes: [], // Exclude Prescription attributes
              include: [
                {
                  model: Patient,
                  where: { id: patientId },
                  attributes: [], // Exclude Patient attributes
                },
              ],
            },
          ],
          attributes: [], // Exclude Cure attributes
        },
      ],
      where: { 
        '$Cure.Prescription.Patient.id$': patientId, // Restrict the query to the specified patient
        startDate: { [Op.gt]: new Date() } // Get products after the current date
      },
      order: [['startDate', 'ASC']], // Order by ascending start date to get the next session
      limit: 1 // Limit the result to one product
    });

    if (!nextSessionProduct) {
      // If no product is found for the given conditions, return a message indicating no next session
      return res.status(200).json({ message: 'No next session found for the specified patient' });
    } else {
      res.status(200).json(nextSessionProduct);
    }
  } catch (error) {
    console.error('Error fetching next session product by patient ID:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};




module.exports = {
  getProductsByPatientId,
  getNextSessionByPatientId
};
