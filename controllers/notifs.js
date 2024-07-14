const { Notification, Product, Cure, Prescription, Patient, User } = require('../models/models_chimio/index');
const cron = require('node-cron');
const { Op } = require('sequelize');

// Socket.io instance
let io;

// Function to set up Socket.io instance
const initSocketIo = (socketIoInstance) => {
  io = socketIoInstance;
};

const getNextSessionsForAllUsers = async (req, res) => {
  try {
    // Find all users with ref_ch set
    const users = await User.findAll({
      where: { ref_ch: { [Op.not]: null } },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users with ref_ch found' });
    }

    // Iterate through each user to find the next session
    for (const user of users) {
      const ref_ch = user.ref_ch;

      // Now you have the ref_ch, find the patient ID
      const patient = await Patient.findByPk(ref_ch);

      if (!patient) {
        console.error(`Patient not found for user ID ${user.id}`);
        continue; // Skip to the next user
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

      if (nextSessionProduct && isTomorrow(nextSessionProduct.startDate)) {
        // If next session is tomorrow, generate a notification
        const notificationMessage = `You have a session that is scheduled for tomorrow. Don't forget!\nPlease check your calendar for more information about your session.`;
        const newNotification = await Notification.create({
          userId: user.id,
          message: notificationMessage,
          isRead: false,
        });

        // Emit the new notification to connected clients
        if (io) {
          io.emit('newNotification', newNotification);
        }
      }
    }

    // Note: Since there's no direct HTTP request/response in a cron job, we're using console.log
    console.log('Notifications generated successfully');
  } catch (error) {
    console.error('Error fetching next sessions and generating notifications:', error);
    // Note: In a cron job, we don't have a direct response object, so we can't send an HTTP response
  }
};

// Helper function to check if a date is tomorrow
const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

// Schedule the job to run every day at midnight (00:00)
cron.schedule('21 11 * * *', async () => {
  try {
    // Call the function to get next sessions for all users
    await getNextSessionsForAllUsers({}, { status: () => {} });
    console.log('Next sessions checked and notifications generated');
  } catch (error) {
    console.error('Error during cron job execution:', error);
  }
});

// REST API endpoint to get all notifications for a user
const getAllNotificationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all notifications for the given user
    const notifications = await Notification.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']], // Order notifications by creation date, you can adjust this based on your needs
    });

    // Send the notifications as a response
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    // Send an error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  initSocketIo,
  getNextSessionsForAllUsers,
  getAllNotificationsForUser,
};
