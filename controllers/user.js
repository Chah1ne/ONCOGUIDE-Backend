const bcrypt = require('bcrypt');
const UserModel = require('../models/models_chimio/user');
const PatientModel = require('../models/models_chimio/patients');
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const User = require('../models/models_chimio/user');



const updateUserRefCh = async (req, res) => {
  try {
      const userId = req.params.userId;
      const { ref_ch } = req.body;

      const patient = await PatientModel.findOne({ where: { id: ref_ch } });

      if (!patient) {
          return res.status(404).json({ error: 'Invalid reference' });
      }

      const [updatedRowsCount, updatedUsers] = await UserModel.update(
          { ref_ch },
          { returning: true, where: { id: userId } }
      );

      if (updatedRowsCount === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = updatedUsers[0];

      res.status(200).json(updatedUser);
  } catch (error) {
      console.error(error);
      res.status(error.status || 500).json({ error: error.message });
  }
};

///////////////////////////////////////////////////


const addIdManuallyWithBirthDate = async (req, res) => {
try {
    const userId = req.params.userId;
    const { ref_ch, birthDate } = req.body;

    // Recherche du patient dans la table Patient en utilisant l'ID fourni
    const patient = await PatientModel.findByPk(ref_ch);

    // Vérification si le patient existe et si la date de naissance correspond
    if (!patient || patient.birthDate !== birthDate) {
        return res.status(404).json({ error: 'Invalid reference or birth date' });
    }

    // Mise à jour du champ ref_ch dans la table User
    const [updatedRowsCount, updatedUsers] = await UserModel.update(
        { ref_ch },
        { returning: true, where: { id: userId } }
    );

    if (updatedRowsCount === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = updatedUsers[0];

    res.status(200).json(updatedUser);
} catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
}
};









const getPatientNameAndSurname = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await UserModel.findByPk(userId);
    if (!user || !user.ref_ch) {
      return res.status(404).json({ error: 'User not found or ref_ch not set' });
    }

    const patientId = user.ref_ch;

    const patient = await PatientModel.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { nom, prenom } = patient;

    res.status(200).json({ nom, prenom });
  } catch (error) {
    console.error('Error fetching patient name and surname:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Method to update user's password
const updateUserPassword = async (req, res) => {
  try {
      const userId = req.params.userId;
      const { oldPassword, newPassword } = req.body;

      // Fetch the user from the database
      const user = await UserModel.findByPk(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid old password' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await UserModel.update(
          { password: hashedPassword },
          { where: { id: userId } }
      );

      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(error.status || 500).json({ error: error.message });
  }
};





// Endpoint to send verification code to old email
// Endpoint to send verification code to old email
const sendVerificationCode = async (req, res) => {
  try {
    const { userId, oldEmail, newEmail } = req.body;

    // Check if the user exists in the database
    const user = await UserModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found in the database' });
    }

    // Verify if the user's email matches the provided old email
    if (user.email !== oldEmail) {
      return res.status(400).json({ error: 'Old email does not match the user email' });
    }

    // Generate verification code (you can use any method to generate a random code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    user.verificationCode = verificationCode;
    await user.save();
    // Send verification code to old email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mezghaniborhen@gmail.com', // Your Gmail address
        pass: 'ocusihbvudzelpzn' // Your Gmail password
      }
    });

    const mailOptions = {
      from: 'mezghaniborhen@gmail.com',
      to: oldEmail,
      subject: 'Verification Code for Email Change',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification Code</title>
  <style>
    /* Add styles for the email content */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
      text-align: center;
    }
    p {
      color: #666;
      text-align: justify;
    }
    .logo {
      display: block;
      margin: 0 auto;
      width: 200px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="https://res.cloudinary.com/dynwgij8y/image/upload/v1714400908/jdjqstfgwnde6ilzlbzd.png" alt="OncoGuide Logo">
    <h1>Email Verification Code</h1>
    <p>Your verification code is: <strong>${verificationCode}</strong></p>
    <p>Please use this code to verify your email address and complete the email change process.</p>
    <p>If you didn't request this change, please ignore this email.</p>
    <p>Thank you,</p>
    <p>OncoGuide Team</p>
  </div>
</body>
</html>

    `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification code sent successfully', verificationCode });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Endpoint to verify verification code and update email
const changeEmail = async (req, res) => {
  try {
    const { userId, oldEmail, newEmail, verificationCode } = req.body;
    console.log (req.body.oldEmail,"l email l je");

    // Check if the user exists in the database
    const user = await UserModel.findOne({ where: { email : oldEmail } });
    if (!user) {
      return res.status(404).json({ error: 'Old email not found in the database' });
    }
console.log (user.email);
    // Retrieve the stored verification code from the user document
    const storedVerificationCode = user.verificationCode;

    // Verify the provided verification code
    if (storedVerificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update user's email and clear the verification code
    user.email = newEmail;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Email changed successfully' });
  } catch (error) {
    console.error('Error changing email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Method to send verification code for password reset
const sendPasswordResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found in the database' });
    }

    // Generate verification code (you can use any method to generate a random code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    user.verificationCode = verificationCode;
    await user.save();
    
    // Send verification code to the provided email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mezghaniborhen@gmail.com', // Your Gmail address
        pass: 'ocusihbvudzelpzn' // Your Gmail password
      }
    });

    const mailOptions = {
      from: 'mezghaniborhen@gmail.com',
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Verification Code</title>
        <style>
          /* Add styles for the email content */
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
            text-align: center;
          }
          p {
            color: #666;
            text-align: justify;
          }
          .logo {
            display: block;
            margin: 0 auto;
            width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="https://res.cloudinary.com/dynwgij8y/image/upload/v1714400908/jdjqstfgwnde6ilzlbzd.png" alt="Your Logo">
          <h1>Password Reset Verification Code</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>Please use this code to reset your password.</p>
          <p>If you didn't request this change, please ignore this email.</p>
          <p>Thank you,</p>
          <p>Your Team</p>
        </div>
      </body>
      </html>
    `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification code sent successfully', verificationCode });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Method to reset user's password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, verificationCode } = req.body;

    // Check if the email exists in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found in the database' });
    }

    // Retrieve the stored verification code from the user document
    const storedVerificationCode = user.verificationCode;

    // Verify the provided verification code
    if (storedVerificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear the verification code
    user.password = hashedPassword;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};






module.exports = {
    updateUserRefCh,
    addIdManuallyWithBirthDate,
    getPatientNameAndSurname,
    updateUserPassword,
    sendVerificationCode,
    changeEmail,
    sendPasswordResetCode,
    resetPassword,
};
