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
    // For now, return hardcoded data. Later this will fetch from Firestore.
    const sampleData = [
        {
            id: '1',
            title: 'Innovations in Cosmetic Dentistry: A 2024 Review',
            publication: 'Journal of Dental Science',
            publicationDate: '2024-05-15',
            url: 'https://example.com/article1'
        },
        {
            id: '2',
            title: 'The Impact of AI on Orthodontic Treatment Planning',
            publication: 'Dental Technology Today',
            publicationDate: '2023-11-20',
            url: 'https://example.com/article2'
        }
    ];
    res.json(sampleData);
});

app.use('/articles', articlesRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Articles service listening on port ${port}`);
});
