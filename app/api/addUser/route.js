// pages/api/addUser.js
import clientPromise from '../../lib/mongodb'; // Ensure this path points to your MongoDB client file

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            console.log('Received POST request:', req.body); // Log request body

            const { name, email } = req.body;

            if (!name || !email) {
                console.log('Missing name or email');
                return res.status(400).json({ message: 'Name and email are required' });
            }

            const client = await clientPromise.catch((err) => {
                console.error("MongoDB connection failed:", err);
                return null;
            });

            if (!client) {
                return res.status(500).json({ message: 'Failed to connect to the database' });
            }

            const db = client.db('testproject');
            const collection = db.collection('test');

            console.log('Inserting data into MongoDB'); // Log before insertion
            const result = await collection.insertOne({ name, email });

            console.log('User created successfully', result);
            res.status(201).json({ message: 'User created successfully', result });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
