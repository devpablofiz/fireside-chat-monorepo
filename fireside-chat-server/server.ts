import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

const serviceAccount = require('./firebase-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// Authentication middleware
const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }

        req.user = await auth.verifyIdToken(token);
        next();
    } catch (error) {
        res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Create a new chat
app.post('/createChat', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { chatName } = req.body;
        const userId = req.user?.name;

        if (!chatName) {
            res.status(400).json({ error: 'Chat name is required' });
            return;
        }

        if(!userId){
            res.status(400).json({ error: 'Authentication error' });
            return;
        }

        const chatRef = db.collection('chats').doc();
        await chatRef.set({
            chatName,
            userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // 10 minutes later
        });

        res.status(201).json({ message: 'Chat created successfully', chatId: chatRef.id });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send a message to a chat
app.post('/sendMessage', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { chatId, message } = req.body;
        const userId = req.user?.name;

        if (!chatId || !message) {
            res.status(400).json({ error: 'chatId and message are required' });
            return;
        }

        if (!userId) {
            res.status(400).json({ error: 'Authentication error' });
            return;
        }

        const chatRef = db.collection('chats').doc(chatId);
        const chatSnap = await chatRef.get();

        if (!chatSnap.exists) {
            res.status(404).json({ error: 'Chat not found' });
            return;
        }

        const chatData = chatSnap.data();
        const firestoreTime = admin.firestore.Timestamp.now(); // Get Firestore server time

        if (!chatData || chatData.expiresAt.toMillis() <= firestoreTime.toMillis()) {
            res.status(403).json({ error: 'Chat has expired' });
            return;
        }

        const messageRef = chatRef.collection('messages').doc();
        await messageRef.set({
            userId,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Extend chat expiration time
        await chatRef.update({
            expiresAt: admin.firestore.Timestamp.fromMillis(chatData.expiresAt.toMillis() + 10 * 60 * 1000),
        });

        res.status(201).json({ message: 'Message sent successfully', messageId: messageRef.id });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
