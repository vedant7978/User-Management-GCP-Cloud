const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // CORS middleware

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Universal handler for CORS
const handleCors = (handler) => (req, res) => cors(req, res, () => handler(req, res));

// Define the updateUser function with CORS handling
functions.http(
  'updateUser',
  handleCors(async (req, res) => {
    try {
      const { userId, name, email } = req.body;

      // Validate input
      if (!userId || !name || !email) {
        return res.status(400).send({ message: 'Missing required fields: userId, name, or email.' });
      }

      // Reference to the Firestore document
      const userRef = firestore.collection('UsersTable').doc(userId); // Replace with your Firestore collection name

      // Check if the user exists
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).send({ message: 'User not found.' });
      }

      // Update user details
      await userRef.update({ Name: name, Email: email });

      res.status(200).send({ message: 'User updated successfully!' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send({ error: error.message });
    }
  })
);
