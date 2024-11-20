const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // CORS middleware

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Initialize Cloud Storage
const storage = new Storage();
const BUCKET_NAME = 'users-images-13999'; // Replace with your GCP bucket name

// Universal handler for CORS
const handleCors = (handler) => (req, res) => cors(req, res, () => handler(req, res));

// Define the deleteUser function with CORS handling
functions.http('deleteUser', handleCors(async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate input
        if (!userId) {
            return res.status(400).send({ message: 'Missing required field: userId.' });
        }

        // Get user details from Firestore to fetch the image URL
        const userRef = firestore.collection('UsersTable').doc(userId); // Replace with your Firestore collection name
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).send({ message: 'User not found.' });
        }

        const userData = userDoc.data();
        const imageUrl = userData.ImageURL;
        const imageKey = imageUrl.split('/').pop(); // Get the file name from the URL

        // Delete the image from Cloud Storage
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(imageKey);
        await file.delete();

        // Delete the user document from Firestore
        await userRef.delete();

        res.status(200).send({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({ error: error.message });
    }
}));
