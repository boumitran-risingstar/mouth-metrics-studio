
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = admin.firestore();

const app = express();
const port = parseInt(process.env.PORT || '8084', 10);

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
            // Don't send a 401, just proceed without a user.
        }
    }
    next();
};

app.get('/', (req: Request, res: Response) => {
  res.send('Education service is running!');
});

const educationRouter = express.Router();
educationRouter.use(checkAuth);

educationRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.json([]);
    }

    try {
        const educationCol = db.collection('users').doc(userId).collection('educations');
        const snapshot = await educationCol.orderBy('graduationYear', 'desc').get();
        
        if (snapshot.empty) {
            return res.json([]);
        }

        const educationData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(educationData);
    } catch (error) {
        console.error(`Error fetching education for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

educationRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to save education.' });
    }
    const { educations } = req.body;

    if (!Array.isArray(educations)) {
        return res.status(400).json({ error: 'Request body must contain an array of educations.' });
    }

    try {
        const educationCol = db.collection('users').doc(userId).collection('educations');
        const batch = db.batch();

        // Delete existing documents
        const snapshot = await educationCol.get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new documents
        educations.forEach(edu => {
            const { id, ...eduData } = edu; // Exclude ID if passed from client
            const docRef = educationCol.doc(); // Let Firestore generate a new ID
            batch.set(docRef, {
                ...eduData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();

        // Fetch and return the newly saved data
        const newSnapshot = await educationCol.orderBy('graduationYear', 'desc').get();
        const savedEducations = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(201).json(savedEducations);

    } catch (error) {
        console.error(`Error saving education for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


app.use('/educations', educationRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Education service listening on port ${port}`);
});
