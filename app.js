const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const http = require('http');
const https = require('https'); // Importation du module https
const socketIo = require('socket.io');
const sequelize = require('./config/database');
const models = require('./models/models_chimio/index');
const cureRoutes = require('./routes/cures');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middlewares/auth');
const notifRoutes = require('./routes/notifs');
const messagerieRoutes = require ('./routes/messagerie'); 
const SideEffectsRoutes = require ('./routes/SideEffects');
const educationRoutes = require('./routes/education');
const cardAssignmentsRoutes = require('./routes/CardAssignments');


const axios = require('axios');

const app = express();
const server = http.createServer(app);  // Replace 'app.listen' with 'http.createServer'

require('dotenv').config();
app.use(helmet());
app.use(morgan('dev'));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/cure',  cureRoutes);
app.use('/products',  productRoutes);
app.use('/user',  userRoutes);
app.use('/notif', notifRoutes);
app.use('/', authRoutes);
app.use('/messages', messagerieRoutes); 
app.use('/side-effects', SideEffectsRoutes); 
app.use('/education', educationRoutes);
app.use('/card-assignments', cardAssignmentsRoutes);

// Socket.io setup
const io = socketIo(server);
const notifController = require('./controllers/notifs');
notifController.initSocketIo(io);  // Pass the Socket.io instance to the notification controller

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});




// Import des modèles Sequelize
const { Patient, Prescription, Cure, Product } = models;

// Fonction pour insérer les données JSON dans les tables de base de données
async function insererDonnees(jsonData) {
  try {
    // Parcourir chaque objet patient dans le JSON
    for (const patientData of jsonData) {
      const existingPatient = await Patient.findOne({ where: { id: patientData.id } });
      
      if (existingPatient) {
        console.log(`Le patient avec l'ID ${patientData.id} existe déjà dans la base de données. Mettre à jour les informations si nécessaire.`);
      } else {
        // L
      // Insérer le patient dans la table Patient
      const patient = await Patient.create({
        id: patientData.id,
        DMI: patientData.DMI,
        index: patientData.index,
        nom: patientData.nom,
        prenom: patientData.prenom,
        sexe: patientData.sexe,
        matrimonial: patientData.matrimonial,
        birthDate: patientData.birthDate,
        poids: patientData.poids,
        taille: patientData.taille,
        surfCorp: patientData.surfCorp,
        creatinine: patientData.creatinine,
        formuleClair: patientData.formuleClair,
        clairance: patientData.clairance,
        commentaire: patientData.commentaire,
      });

      // Si le patient a des prescriptions
      if (patientData.prescription && patientData.prescription.length > 0) {
        // Parcourir chaque prescription du patient
        for (const prescriptionData of patientData.prescription) {
          // Insérer la prescription dans la table Prescription
          const prescription = await Prescription.create({
            id: prescriptionData.id,
            id_patient: prescriptionData.id_patient,
            id_parent: prescriptionData.id_parent,
            prescripteur: prescriptionData.prescripteur,
            startDate: prescriptionData.startDate,
            nbrCures: prescriptionData.nbrCures,
            essaiClin: prescriptionData.essaiClin,
            commentaire: prescriptionData.commentaire,
          });

          // Si la prescription a des cures
          if (prescriptionData.cure && prescriptionData.cure.length > 0) {
            // Parcourir chaque cure de la prescription
            for (const cureData of prescriptionData.cure) {
              // Insérer la cure dans la table Cure
              const cure = await Cure.create({
                id: cureData.id,
                id_prescription: cureData.id_prescription,
                name: cureData.name,
                startDate: cureData.startDate,
                state: cureData.state,
              });

              // Si la cure a des produits
              if (cureData.product && cureData.product.length > 0) {
                // Parcourir chaque produit de la cure
                for (const productData of cureData.product) {
                  // Insérer le produit dans la table Product
                  await Product.create({
                    id: productData.id,
                    id_cure: productData.id_cure,
                    id_molecule: productData.id_molecule,
                    dose: productData.dose,
                    name: productData.name,
                    startDate: productData.startDate,
                    validation: productData.validation,
                    adjusted: productData.adjusted,
                    liberer: productData.liberer,
                    terminer: productData.terminer,
                  });
                }
              }
            }
          }
        }
      }
    }
  }
    console.log('Données insérées avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données :', error);
  }
}

// Route pour récupérer les données depuis l'API externe et les insérer dans la base de données
// Fonction pour récupérer les données depuis l'API externe
async function recupererDonneesAPI() {
  try {
    const response = await axios.get('https://102.219.179.156:7006/patient/prescription', { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const jsonData = response.data;
    await insererDonnees(jsonData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données depuis l\'API :', error);
  }
}
// Synchronize the database with the Sequelize models and create the database if it doesn't exist
sequelize.sync({ force: false }) // Set force to false for production
  .then(() => {
    console.log('Database synchronized successfully');

    // Start the server once synchronization is completed
    const PORT = process.env.PORT || 8081;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

      // Essayer de récupérer les données toutes les 5 minutes
      setInterval(recupererDonneesAPI, 5 * 60 * 1000); // 5 minutes


    });
  })
  .catch((err) => {
    console.error('Error synchronizing the database:', err);
  });

module.exports = app;
