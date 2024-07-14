const { Patient, Prescription, Cure , User} = require('../models/models_chimio/index');
const cron = require('node-cron');
const { Op } = require('sequelize');


//afficher selon id patient le contenu lié de ca prescription et le cure aussi 

const getCuresByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const patientCures = await Cure.findAll({
      include: [
        {
          model: Prescription,
          where: { id_patient: patientId },
          include: [
            {
              model: Patient,
              where: { id: patientId },
            },
          ],
        },
      ],
    });

    res.status(200).json(patientCures);
  } catch (error) {
    console.error('Error fetching cures by patient ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//---------------------------------------------------
//afficher selon id patient le contenu lié de ca cures


const getCureDatesByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const patientCureDates = await Cure.findAll({
      attributes: ['startDate', 'state'], 
      include: [
        {
          model: Prescription,
          attributes: [], 
          where: { id_patient: patientId },
          include: [
            {
              model: Patient,
              where: { id: patientId },
              attributes: [], 
            },
          ],
        },
      ],
    });

    res.status(200).json(patientCureDates);
  } catch (error) {
    console.error('Error fetching cure dates by patient ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



//---------------------------------------------------
//afficher selon id patient le contenu lié de ca cures avec filtre de state (en cour , prevu)

const getCureStateByPatientId = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const stateFilter = req.params.state; // Récupérer le paramètre d'état de l'URL

    // Utilisez la méthode findAll avec les options d'inclusion pour récupérer les dates des cures du patient
    const patientCureDates = await Cure.findAll({
      attributes: ['startDate', 'state'],
      where: {
        '$prescription.patient.id$': patientId,
        state: stateFilter,
      },
      include: [
        {
          model: Prescription,
          attributes: [],
          where: { id_patient: patientId },
          include: [
            {
              model: Patient,
              attributes: [],
            },
          ],
        },
      ],
    });

    res.status(200).json(patientCureDates);
  } catch (error) {
    console.error('Error fetching cure dates by patient ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//------------------------------------------------------------------------------
// Fonction pour récupérer le progrès de traitement d'un patient

const getTreatmentProgress = async (req, res) => {
  try {
    const userId = req.params.userId; // Récupérer l'identifiant de l'utilisateur

    // Trouver le champ ref_ch correspondant à l'identifiant de l'utilisateur
    const user = await User.findByPk(userId);
    if (!user || !user.ref_ch) {
      return res.status(404).json({ error: 'User not found or ref_ch not set' });
    }

    const patientId = user.ref_ch; // Utiliser le champ ref_ch pour obtenir l'identifiant du patient correspondant

    // Récupérer le nombre total de cures prévues pour le patient
    const totalCures = await Prescription.sum('nbrCures', { where: { id_patient: patientId } });

    // Vérifier si toutes les cures sont en cours
    const allCuresInProgress = await Cure.count({
      where: {
        '$prescription.id_patient$': patientId,
        state: 'En Cours',
      },
      include: {
        model: Prescription,
        attributes: [],
      }
    }) === totalCures;

    // Déclarer et initialiser la variable inProgressCures
    let inProgressCures = 0;

    // Calculer le pourcentage de progression
    let progressPercentage = 0.0;
    if (allCuresInProgress) {
      progressPercentage = 100; // Toutes les cures sont en cours, donc 100% de progression
      inProgressCures = totalCures; // Si toutes les cures sont en cours, le nombre de cures en cours est égal au total des cures
    } else {
      inProgressCures = await Cure.count({
        where: {
          '$prescription.id_patient$': patientId,
          state: 'En Cours',
        },
        include: {
          model: Prescription,
          attributes: [],
        },
      });
      progressPercentage = ((inProgressCures / totalCures) * 100).toFixed(2);
    }

    // Chaîne de texte pour informer l'utilisateur du nombre de cures en cours et du nombre total de cures
    const progressText = `${inProgressCures}/${totalCures}`;

    res.status(200).json({ totalCures, progressPercentage, progressText });
  } catch (error) {
    console.error('Error fetching treatment progress:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const getTreatmentProgress = async (req, res) => {
//   try {
//     const patientId = req.params.patientId;

//     // Récupérer le nombre total de cures prévues pour le patient
//     const totalCures = await Prescription.sum('nbrCures', { where: { id_patient: patientId } });

//     // Vérifier si toutes les cures sont en cours
//     const allCuresInProgress = await Cure.count({
//       where: {
//         '$prescription.id_patient$': patientId,
//         state: 'En Cours',
//       },
//       include: {
//         model: Prescription,
//         attributes: [],
//       }
//     }) === totalCures;

//     // Déclarer et initialiser la variable inProgressCures
//     let inProgressCures = 0;

//     // Calculer le pourcentage de progression
//     let progressPercentage = 0;
//     if (allCuresInProgress) {
//       progressPercentage = 100; // Toutes les cures sont en cours, donc 100% de progression
//       inProgressCures = totalCures; // Si toutes les cures sont en cours, le nombre de cures en cours est égal au total des cures
//     } else {
//       inProgressCures = await Cure.count({
//         where: {
//           '$prescription.id_patient$': patientId,
//           state: 'En Cours',
//         },
//         include: {
//           model: Prescription,
//           attributes: [],
//         },
//       });
//       progressPercentage = (inProgressCures / totalCures) * 100;
//     }

//     // Chaîne de texte pour informer l'utilisateur du nombre de cures en cours et du nombre total de cures
//     const progressText = `${inProgressCures}/${totalCures}`;

//     res.status(200).json({ totalCures, progressPercentage, progressText });
//   } catch (error) {
//     console.error('Error fetching treatment progress:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


// Function to update the cure states based on StartDate
const updateCureStateByStartDate = async () => {
  try {
    const currentDate = new Date();

    // Find cures where StartDate is less than or equal to the current date and state is 'prévu'
    const curesToUpdate = await Cure.findAll({
      where: {
        startDate: {
          [Op.lte]: currentDate
        },
        state: 'prévu'
      },
      include: [
        {
          model: Prescription,
          include: [
            {
              model: Patient
            }
          ]
        }
      ]
    });

    // Update the state of found cures to 'En Cours'
    for (const cure of curesToUpdate) {
      await cure.update({ state: 'En Cours' });
      console.log(`Cure ${cure.id} state updated to 'En Cours'`);
    }
  } catch (error) {
    console.error('Error updating cure state by StartDate:', error);
  }
};

// Schedule the cron job to run at 9:45 AM every day
cron.schedule('30 12 * * *', async () => {
  console.log('Running cron job to update cure states...');
  await updateCureStateByStartDate();
});

// Function to call updateCureStateByStartDate immediately (optional)
const runImmediately = async () => {
  console.log('Running update immediately...');
  await updateCureStateByStartDate();
};

module.exports = {
  getCuresByPatientId,
  getCureDatesByPatientId,
  getCureStateByPatientId,
  getTreatmentProgress,
  updateCureStateByStartDate

  // ... autres méthodes du contrôleur
};
