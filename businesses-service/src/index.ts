import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin SDK
// The SDK will automatically use Google Application Default Credentials on Cloud Run
admin.initializeApp();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Middleware to check authentication
const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            (req as any).user = decodedToken;
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

// Example business route
businessRouter.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // In a real application, you would fetch business data from a database
    res.json({ id, name: `Business #${id}`, address: '123 Main St' });
});

app.use('/businesses', businessRouter);


app.listen(port, () => {
  console.log(`Businesses service listening on port ${port}`);
});
