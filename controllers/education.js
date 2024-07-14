const { Education } = require('../models/models_chimio/index');





const createEducation = async (req, res) => {
  try {
    const { senderId, name, iconImage, description, images, video } = req.body;

    // Vérifiez si des champs obligatoires sont manquants
    if (!senderId || !name || !description || !iconImage) {
      return res.status(400).json({ error: "Des champs obligatoires sont manquants" });
    }

    // Autres validations éventuelles à ajouter selon vos besoins

    const newEducation = await Education.create({
      senderId,
      name,
      iconImage,
      description,
      images,
      video // Ajoutez le champ video dans la création de l'éducation
    });

    res.status(201).json(newEducation);
  } catch (error) {
    console.error('Error creating education:', error);
    res.status(500).json({ error: "Une erreur s'est produite lors de la création de l'expérience éducative" });
  }
};



module.exports = {
  createEducation
};

// Récupérer toutes les expériences éducatives d'un utilisateur spécifique (médecin)
const getAllEducationsBySender = async (req, res) => {
  try {
    const { senderId } = req.params;

    const educations = await Education.findAll({ where: { senderId } });

    res.status(200).json(educations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Mettre à jour une expérience éducative
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, name, iconImage, description, images, video } = req.body;

    const education = await Education.findByPk(id);
    if (!education) {
      return res.status(404).json({ message: "Education not found" });
    }

    // Mettre à jour les URL des images si de nouvelles images sont fournies
    if (images && images.trim() !== '') {
      // Supprimer les anciennes URL des images de Cloudinary (si nécessaire)
      // Ajouter le code pour supprimer les anciennes URL des images de Cloudinary ici

      // Mettre à jour les URL des images avec les nouvelles URL fournies
      education.images = images;
    }

    // Mettre à jour les autres champs de l'éducation
    education.senderId = senderId;
    education.name = name;
    education.iconImage = iconImage;
    education.description = description;
    education.video = video;

    // Enregistrer les modifications dans la base de données
    await education.save();

    // Répondre avec l'éducation mise à jour
    res.status(200).json(education);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Supprimer une expérience éducative
const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedEducation = await Education.destroy({
      where: { id }
    });

    if (!deletedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.status(200).json({ message: "Education deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// // Fonction pour affecter des cartes sélectionnées à un utilisateur
// const assignCardsToUser = async (req, res) => {
//   try {
//     const { userId, cardIds } = req.body;

//     // Récupérer les cartes éducatives par leurs identifiants (vous devez également implémenter cette logique)
//     const educations = await Education.findAll({ where: { id: cardIds } });

//     // Vérifier si toutes les cartes éducatives existent
//     if (educations.length !== cardIds.length) {
//       // S'il manque des cartes éducatives, retourner une erreur 404
//       return res.status(404).json({ error: "Certaines cartes éducatives n'existent pas" });
//     }

//     // Assigner les cartes éducatives à l'utilisateur en mettant à jour le champ idUser de chaque carte
//     await Promise.all(educations.map(async (education) => {
//       education.idUser = userId;
//       await education.save();
//     }));

//     res.status(200).json({ message: "Cartes attribuées avec succès à l'utilisateur" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




module.exports = {
  createEducation,
  getAllEducationsBySender,
  updateEducation,
  deleteEducation,
  //assignCardsToUser,
};
