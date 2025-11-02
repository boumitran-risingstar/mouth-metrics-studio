
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

// Initialize Firebase Admin SDK
// The SDK will automatically use Google Application Default Credentials on Cloud Run
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}
const db = admin.firestore();

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
            // Don't fail the request, just don't attach the user
        }
    }
    next();
};


app.get('/', (req: Request, res: Response) => {
  res.send('Profile service is running!');
});

const profileRouter = express.Router();

// Create or update user profile
profileRouter.post('/', checkAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { name, emails } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(401).json({ error: 'User must be logged in to update profile.' });
    }

    try {
        const userRef = db.collection('users').doc(uid);
        const data: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Only add fields if they are provided in the request
        if (name !== undefined) {
            data.name = name;
        }
        if (emails !== undefined) {
            // Ensure emails is always an array, even if it's empty
            data.emails = Array.isArray(emails) ? emails : [];
        }

        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            data.createdAt = admin.firestore.FieldValue.serverTimestamp();
            // Set defaults for new users if not provided
            if (name === undefined) data.name = '';
            if (emails === undefined) data.emails = [];
        }
        
        await userRef.set(data, { merge: true });

        const updatedUserDoc = await userRef.get();
        res.status(200).json({ id: updatedUserDoc.id, ...updatedUserDoc.data() });
    } catch (error) {
        console.error(`Error creating/updating user profile for ${uid}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


// Example user route
profileRouter.get('/:id', checkAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const requestingUid = req.user?.uid;

    if (id !== requestingUid) {
        return res.status(403).json({ error: 'Forbidden: You can only access your own profile.' });
    }

    try {
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            // If user doc doesn't exist, create a shell profile from Auth data
            const authUser = await admin.auth().getUser(id);
            const newUser = {
                phoneNumber: authUser.phoneNumber,
                name: authUser.displayName || '',
                emails: authUser.email ? [{ address: authUser.email, verified: authUser.emailVerified }] : [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection('users').doc(id).set(newUser);
            return res.json({ id, ...newUser });
        }
        res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

app.use('/profile', profileRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Profile service listening on port ${port}`);
});
