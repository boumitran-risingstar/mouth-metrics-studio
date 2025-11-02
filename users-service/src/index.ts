
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// The SDK will automatically use Google Application Default Credentials on Cloud Run
admin.initializeApp();
const db = admin.firestore();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// Middleware to check authentication
const checkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error('Error while verifying Firebase ID token:', error);
            return res.status(401).send('Unauthorized');
        }
    } else {
        return res.status(401).send('Unauthorized');
    }
};


app.get('/', (req: Request, res: Response) => {
  res.send('Users service is running!');
});

const userRouter = express.Router();

// Create or update user profile
userRouter.post('/', checkAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { phoneNumber } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(400).json({ error: 'User UID not found in token.' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.set({
            phoneNumber,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        const userDoc = await userRef.get();
        res.status(201).json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error(`Error creating/updating user profile for ${uid}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


// Example user route
userRouter.get('/:id', checkAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const requestingUid = req.user?.uid;

    if (id !== requestingUid) {
        return res.status(403).json({ error: 'Forbidden: You can only access your own profile.' });
    }

    try {
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

app.use('/users', userRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Users service listening on port ${port}`);
});
