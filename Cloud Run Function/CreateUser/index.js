const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors')({ origin: true }); // CORS middleware

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Initialize Cloud Storage
const storage = new Storage();
const BUCKET_NAME = 'users-images-13999'; // Replace with your GCP bucket name

// Universal handler for CORS
const handleCors = (handler) => (req, res) => cors(req, res, () => handler(req, res));

// Define the createUser function with CORS handling
functions.http('createUser', handleCors(async (req, res) => {
    try {
        const { name, email, image } = req.body;

        // Validate input
        if (!name || !email || !image) {
            return res.status(400).send({ message: 'Missing required fields: name, email, or image.' });
        }

        // Check if a user with the given email already exists in Firestore
        const usersRef = firestore.collection('UsersTable'); // Replace with your Firestore collection name
        const userSnapshot = await usersRef.where('Email', '==', email).get();

        if (!userSnapshot.empty) {
            return res.status(400).send({ message: 'User with this email already exists.' });
        }

        const userId = uuidv4(); // Generate a unique user ID

        // Decode the base64 image and upload to Cloud Storage
        const imageBuffer = Buffer.from(image, 'base64');
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(`${userId}.jpg`);
        await file.save(imageBuffer, {
            contentType: 'image/jpeg',
            metadata: {
                contentEncoding: 'base64'
            }
        });

        const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${userId}.jpg`;

        // Store user details in Firestore
        await usersRef.doc(userId).set({
            UserID: userId,
            Name: name,
            Email: email,
            ImageURL: imageUrl
        });

        res.status(200).send({ message: 'User created successfully!', userId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send({ error: error.message });
    }
}));
