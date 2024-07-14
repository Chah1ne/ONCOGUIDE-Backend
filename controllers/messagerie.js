const { Messagerie, User } = require('../models/models_chimio/index');
const { Op } = require('sequelize');


// Fonction pour créer un nouveau message
async function createMessage(req, res) {
  try {
    const { senderId, receiverId, message } = req.body;

    // Vérifier si l'expéditeur et le destinataire existent
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ error: 'L\'expéditeur ou le destinataire n\'existe pas.' });
    }

    // Créer le message
    const newMessage = await Messagerie.create({
      senderId,
      receiverId,
      message,
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('Erreur lors de la création du message :', error);
    return res.status(500).json({ error: 'Erreur lors de la création du message.' });
  }
}

//----------------------------------------------------------------------------------

// Fonction pour récupérer les messages entre deux utilisateurs
async function getMessagesBetweenUsers(req, res) {
  try {
      const { userId1, userId2 } = req.params;

      // Récupérer les messages entre userId1 et userId2
      const messages = await Messagerie.findAll({
          where: {
              [Op.or]: [
                  { senderId: userId1, receiverId: userId2 },
                  { senderId: userId2, receiverId: userId1 }
              ]
          },
          // Inclure les informations sur l'expéditeur et le destinataire
          include: [
              { model: User, as: 'sender', attributes: ['email'] }, // Sélectionner seulement l'email du sender
              { model: User, as: 'receiver', attributes: ['email'] }, // Sélectionner seulement l'email du receiver
          ],
          attributes: ['message', 'createdAt'], // Sélectionner seulement le message et le createdAt
      });

      // Formater la réponse pour afficher les informations souhaitées
      const formattedMessages = messages.map(message => ({
          sender: message.sender.email,
          message: message.message,
          createdAt: message.createdAt,
          receiver: message.receiver.email,
      }));

      return res.status(200).json(formattedMessages);
  } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
}

  

  //----------------------------------------------------------------------------------------------

  async function getUsersWithMessages(req, res) {
    const { userId } = req.params;

    try {
        // Récupérer tous les messages où l'utilisateur est soit l'expéditeur, soit le destinataire
        const messages = await Messagerie.findAll({
            where: {
                [Op.or]: [{ senderId: userId }, { receiverId: userId }]
            }
        });

        const otherUserIds = new Set();

        // Parcourir tous les messages et ajouter les IDs des autres utilisateurs à un ensemble
        messages.forEach(message => {
            if (message.senderId !== userId) {
                otherUserIds.add(message.senderId);
            }
            if (message.receiverId !== userId) {
                otherUserIds.add(message.receiverId);
            }
        });

        // Convertir l'ensemble d'IDs en tableau
        const otherUserIdsArray = Array.from(otherUserIds);

        // Retirer l'ID de l'utilisateur spécifié dans l'URL du tableau
        const indexToRemove = otherUserIdsArray.indexOf(parseInt(userId));
        if (indexToRemove !== -1) {
            otherUserIdsArray.splice(indexToRemove, 1);
        }

        // Récupérer les informations des autres utilisateurs à partir de leurs IDs
        const otherUsers = await User.findAll({
            where: {
                id: otherUserIdsArray
            }
        });

        // Créer une liste d'objets contenant l'ID et l'e-mail de chaque utilisateur
        const userObjects = otherUsers.map(user => ({ id: user.id, email: user.email }));

        // Envoyer la réponse avec les autres utilisateurs formatés comme spécifié
        res.status(200).json(userObjects);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des utilisateurs avec messages :", error);
        // Envoyer une réponse d'erreur
        res.status(500).json({ error: "Une erreur s'est produite lors de la récupération des utilisateurs avec messages." });
    }
}


  
//------------------------------------------------------------------------------------
 
//ajouter un contact dans chatpage pour discuter avec 

async function addContact(req, res) {
    try {
        const { senderId, receiverEmail } = req.body;

        // Rechercher l'utilisateur recevant le message (receiver)
        const receiver = await User.findOne({ where: { email: receiverEmail } });
        if (!receiver) {
            return res.status(404).json({ success: false, error: 'Utilisateur recevant le message non trouvé' });
        }

        // Vérifier s'il existe déjà des messages entre l'expéditeur et le destinataire
        const existingMessages = await Messagerie.findAll({
            where: {
                senderId: senderId,
                receiverId: receiver.id,
            }
        });

        // Si des messages existent déjà, ne pas envoyer de nouveau message "hello"
        if (existingMessages.length > 0) {
            return res.status(200).json({ success: true, message: 'Contact déjà ajouté, aucun nouveau message envoyé' });
        }

        // Ajouter le message dans la table Messagerie
        await Messagerie.create({
            senderId: senderId,
            receiverId: receiver.id,
            message: 'hello', // Vous pouvez personnaliser le contenu du message ici
        });

        return res.status(200).json({ success: true, message: 'Contact ajouté avec succès!' });
    } catch (error) {
        console.error('Erreur lors de l ajout du contact:', error);
        return res.status(500).json({ success: false, error: 'Erreur lors de l ajout du contact' });
    }
}



//------------------------------------------------------------------------------------


// Fonction pour récupérer le dernier message entre deux utilisateurs


async function getLastMessageBetweenUsers(req, res) {
    try {
      const { userId1, userId2 } = req.params;
  
      // Récupérer le dernier message entre userId1 et userId2
      const lastMessage = await Messagerie.findOne({
        where: {
          [Op.or]: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
          ]
        },
        // Trier par date de création pour obtenir le dernier message en premier
        order: [['createdAt', 'DESC']],
        // Inclure les informations sur l'expéditeur et le destinataire
        include: [
          { model: User, as: 'sender', attributes: ['email'] }, // Sélectionner seulement l'email du sender
          { model: User, as: 'receiver', attributes: ['email'] }, // Sélectionner seulement l'email du receiver
        ],
        attributes: ['message', 'createdAt'], // Sélectionner seulement le message et le createdAt
      });
  
      if (!lastMessage) {
        // Aucun message trouvé entre les utilisateurs
        return res.status(404).json({ error: 'Aucun message trouvé entre les utilisateurs.' });
      }
  
      // Formater la réponse pour renvoyer le dernier message
      const formattedMessage = {
        sender: lastMessage.sender.email,
        message: lastMessage.message,
        createdAt: lastMessage.createdAt,
        receiver: lastMessage.receiver.email,
      };
  
      return res.status(200).json(formattedMessage);
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier message :', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération du dernier message.' });
    }
  }

  


// Exporter les fonctions
module.exports = {
  createMessage,
  getMessagesBetweenUsers,
  getUsersWithMessages,
  addContact,
  getLastMessageBetweenUsers,

};


