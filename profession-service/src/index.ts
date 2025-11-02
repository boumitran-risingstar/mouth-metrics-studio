
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

// Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = admin.firestore();

const app = express();
const port = parseInt(process.env.PORT || '8083', 10);

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

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
  res.send('Profession service is running!');
});

const professionRouter = express.Router();
professionRouter.use(checkAuth);

professionRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(400).json({ error: 'User ID not found' });
    }

    try {
        const professionRef = db.collection('users').doc(userId).collection('profession').doc('details');
        const doc = await professionRef.get();

        if (!doc.exists) {
            // Return default/empty state if no data exists
            const defaultData = {
                title: "",
                industry: "",
                yearsOfExperience: 0,
                skills: [],
            };
            return res.json(defaultData);
        }

        res.json(doc.data());
    } catch (error) {
        console.error(`Error fetching profession for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


professionRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    const professionData = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID not found' });
    }

    // Basic validation
    if (!professionData || typeof professionData.title === 'undefined') {
        return res.status(400).json({ error: 'Invalid profession data provided.' });
    }

    try {
        const professionRef = db.collection('users').doc(userId).collection('profession').doc('details');
        
        await professionRef.set({
            ...professionData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        const updatedDoc = await professionRef.get();
        res.status(200).json(updatedDoc.data());

    } catch (error) {
        console.error(`Error saving profession for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


app.use('/professions', professionRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Profession service listening on port ${port}`);
});
