import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
});

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
            return res.status(401).send('Unauthorized');
        }
    } else {
        return res.status(401).send('Unauthorized');
    }
};

app.get('/', (req: Request, res: Response) => {
  res.send('Education service is running!');
});

const educationRouter = express.Router();
educationRouter.use(checkAuth);

educationRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    // In a real application, you would fetch this data from Firestore for the given userId
    const educationData = [
        {
            degree: "Doctor of Dental Surgery (DDS)",
            institution: "University of Smilewell",
            graduationYear: 2018,
            fieldOfStudy: "Dentistry"
        },
        {
            degree: "Bachelor of Science in Biology",
            institution: "State College",
            graduationYear: 2014,
            fieldOfStudy: "Biology, Pre-Dental"
        }
    ];
    res.json(educationData);
});


app.use('/educations', educationRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Education service listening on port ${port}`);
});
