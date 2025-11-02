
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';

// Initialize Firebase Admin SDK
// The SDK will automatically use Google Application Default Credentials on Cloud Run
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

const app = express();
const port = parseInt(process.env.PORT || '8081', 10);

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
  res.send('Businesses service is running!');
});

// Protect all business routes with the authentication middleware
const businessRouter = express.Router();
businessRouter.use(checkAuth);

// Get all businesses for the authenticated user
businessRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in.' });
    }

    try {
        const businessesRef = db.collection('businesses');
        const snapshot = await businessesRef.where('createdBy', '==', userId).get();
        
        if (snapshot.empty) {
            return res.json([]);
        }

        const businessesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(businessesData);
    } catch (error) {
        console.error(`Error fetching businesses for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


// Create a new business
businessRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to create a business.' });
    }

    const { name, address } = req.body;
    if (!name || !address) {
        return res.status(400).json({ error: 'Missing required fields: name and address.' });
    }

    try {
        const newBusinessRef = db.collection('businesses').doc();
        const newBusiness = {
            name,
            address,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await newBusinessRef.set(newBusiness);

        res.status(201).json({ id: newBusinessRef.id, ...newBusiness });
    } catch (error) {
        console.error(`Error creating business for user ${userId}:`, error);
        res.status(500).send('Internal Server Error');
    }
});

// Example business route
businessRouter.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // This is now a placeholder, actual fetching should be more specific
    res.json({ id, name: `Business #${id}`, address: '123 Main St' });
});

app.use('/businesses', businessRouter);


app.listen(port, '0.0.0.0', () => {
  console.log(`Businesses service listening on port ${port}`);
});
