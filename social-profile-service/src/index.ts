
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

// Initialize Firebase Admin SDK
admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
});

const app = express();
const port = parseInt(process.env.PORT || '8082', 10);

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
  res.send('Social Profile service is running!');
});

const socialRouter = express.Router();
socialRouter.use(checkAuth);

socialRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    // In a real application, you would fetch this data from Firestore for the given userId
    const socialData = [
        { name: "LinkedIn", connected: false },
        { name: "Facebook", connected: false },
        { name: "Instagram", connected: false },
        { name: "X (Twitter)", connected: false },
        { name: "Pinterest", connected: false },
        { name: "GitHub", connected: false },
        { name: "YouTube", connected: false },
    ];
    res.json(socialData);
});

app.use('/social-profiles', socialRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Social Profile service listening on port ${port}`);
});
