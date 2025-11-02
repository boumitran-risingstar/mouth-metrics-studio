
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
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
            // Don't send a 401, let the endpoint handle it.
        }
    }
    next();
};

app.get('/', (req: Request, res: Response) => {
  res.send('Profession service is running!');
});

const professionRouter = express.Router();
professionRouter.use(checkAuth);

professionRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        // Return default/empty state if no user is logged in
        const defaultData = {
            title: "",
            industry: "",
            yearsOfExperience: 0,
            skills: [],
        };
        return res.json(defaultData);
    }

    try {
        const professionRef = db.collection('users').doc(userId).collection('professions').doc('details');
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
    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to save profession details.' });
    }
    const professionData = req.body;

    // Basic validation
    if (!professionData || typeof professionData.title === 'undefined') {
        return res.status(400).json({ error: 'Invalid profession data provided.' });
    }

    try {
        const professionRef = db.collection('users').doc(userId).collection('professions').doc('details');
        
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
