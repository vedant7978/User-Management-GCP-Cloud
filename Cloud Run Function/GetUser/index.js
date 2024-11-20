const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // CORS middleware

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Universal handler for CORS
const handleCors = (handler) => (req, res) => cors(req, res, () => handler(req, res));

// Define the getAllUsers function with CORS handling
functions.http('getAllUsers', handleCors(async (req, res) => {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ message: 'Only GET requests are allowed' });
        }

        // Retrieve all documents from the Firestore collection
        const usersRef = firestore.collection('UsersTable'); // Replace with your Firestore collection name
        const snapshot = await usersRef.get();

        // If no users are found, return an empty list
        if (snapshot.empty) {
            return res.status(200).send({ message: 'No users found', users: [] });
        }

        // Filter valid documents and map Firestore documents to an array of user objects
        const users = snapshot.docs
            .map(doc => doc.data()) // Retrieve the data
            .filter(user => Object.keys(user).length > 0); // Filter out empty objects

        // Return the list of users
        return res.status(200).send({ users });
    } catch (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).send({ error: error.message });
    }
}));
