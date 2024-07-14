const { Education, User, CardAssignments, Notification} = require('../models/models_chimio/index');

// Socket.io instance
let io;

// Function to set up Socket.io instance
const initSocketIo = (socketIoInstance) => {
  io = socketIoInstance;
};
// affectation une carte educatif pour un patient 

const assignCardsToUser = async (req, res) => {
  try {
    const { userId, cardIds } = req.body;

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Iterate through each card ID
    for (const cardId of cardIds) {
      // Check if the card exists
      const educationCard = await Education.findByPk(cardId);
      if (!educationCard) {
        console.log(`Education card with ID ${cardId} not found.`);
        continue; // Skip to the next card
      }

      // Check if the association already exists in CardAssignment
      const existingAssignment = await CardAssignments.findOne({
        where: {
          idUser: userId,
          cardId: cardId
        }
      });

      // If the association does not exist, create a new entry
      if (!existingAssignment) {
        await CardAssignments.create({
          idUser: userId,
          cardId: cardId
        });

        // Fetch user details for notification
        const user = await User.findByPk(userId);
        const notificationMessage = `A new card has been assigned to you by your doctor, Go check it out!`;

        // Save notification entry for the user
        const newNotification = await Notification.create({
          userId: userId,
          message: notificationMessage,
          isRead: false,
        });

        // Emit the new notification to connected clients if applicable
        if (io) {
          io.emit('newNotification', newNotification);
        }
      }
    }

    res.status(200).json({ message: 'Cards assigned successfully' });
  } catch (error) {
    console.error('Error assigning cards to user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// le patient recupere les carte affecté pour lui et l'afficher dans ca interface ces carte 

const getUserCards = async (req, res) => {
  try {
    const userId = req.query.userId; // Utilisez req.query.userId pour récupérer l'ID de l'utilisateur

    // Recherchez les entrées dans CardAssignments pour l'utilisateur spécifié
    const userCardAssignments = await CardAssignments.findAll({
      where: {
        idUser: userId
      }
    });

    // Récupérez les IDs de cartes à partir des entrées trouvées
    const cardIds = userCardAssignments.map(assignment => assignment.cardId);

    // Récupérez les détails des cartes à partir des IDs de cartes
    const userCards = await Education.findAll({
      where: {
        id: cardIds
      }
    });

    res.status(200).json(userCards);
  } catch (error) {
    console.error('Error fetching user cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





module.exports = {
  initSocketIo,
  assignCardsToUser,
  getUserCards,
};
