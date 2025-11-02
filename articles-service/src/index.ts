
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
const port = parseInt(process.env.PORT || '8085', 10);

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
  res.send('Articles and Publications service is running!');
});

const articlesRouter = express.Router();
articlesRouter.use(checkAuth);

articlesRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(400).json({ error: 'User ID not found' });
    }

    try {
        const articlesCol = db.collection('users').doc(userId).collection('articles');
        const snapshot = await articlesCol.orderBy('publicationDate', 'desc').get();
        
        if (snapshot.empty) {
            return res.json([]);
        }

        const articlesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(articlesData);
    } catch (error) {
        console.error(`Error fetching articles for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

articlesRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    const { articles } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID not found' });
    }
    if (!Array.isArray(articles)) {
        return res.status(400).json({ error: 'Request body must contain an array of articles.' });
    }

    try {
        const articlesCol = db.collection('users').doc(userId).collection('articles');
        const batch = db.batch();

        // Delete existing documents
        const snapshot = await articlesCol.get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new documents
        articles.forEach(article => {
            const { id, ...articleData } = article; // Exclude ID if passed from client
            const docRef = articlesCol.doc(); // Let Firestore generate a new ID
            batch.set(docRef, {
                ...articleData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();

        // Fetch and return the newly saved data
        const newSnapshot = await articlesCol.orderBy('publicationDate', 'desc').get();
        const savedArticles = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(201).json(savedArticles);

    } catch (error) {
        console.error(`Error saving articles for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


app.use('/articles', articlesRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Articles service listening on port ${port}`);
});
