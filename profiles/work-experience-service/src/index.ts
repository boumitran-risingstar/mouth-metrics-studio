
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}
const db = admin.firestore();

const app = express();
const port = parseInt(process.env.PORT || '8086', 10);

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
        }
    }
    next();
};

app.get('/', (req: Request, res: Response) => {
  res.send('Work Experience service is running!');
});

const workExperienceRouter = express.Router();
workExperienceRouter.use(checkAuth);

workExperienceRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.json([]);
    }

    try {
        const workExperiencesCol = db.collection('users').doc(userId).collection('workExperiences');
        const snapshot = await workExperiencesCol.orderBy('startDate', 'desc').get();
        
        if (snapshot.empty) {
            return res.json([]);
        }

        const workExperienceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(workExperienceData);
    } catch (error) {
        console.error(`Error fetching work experiences for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

workExperienceRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to save work experience.' });
    }
    const { workExperiences } = req.body;

    if (!Array.isArray(workExperiences)) {
        return res.status(400).json({ error: 'Request body must contain an array of work experiences.' });
    }

    try {
        const workExperiencesCol = db.collection('users').doc(userId).collection('workExperiences');
        const batch = db.batch();

        const snapshot = await workExperiencesCol.get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        workExperiences.forEach(exp => {
            const { id, ...expData } = exp;
            const docRef = exp.id ? workExperiencesCol.doc(exp.id) : workExperiencesCol.doc();
            batch.set(docRef, {
                ...expData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();

        const newSnapshot = await workExperiencesCol.orderBy('startDate', 'desc').get();
        const savedWorkExperiences = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(201).json(savedWorkExperiences);

    } catch (error) {
        console.error(`Error saving work experiences for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


app.use('/work-experiences', workExperienceRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Work Experience service listening on port ${port}`);
});
