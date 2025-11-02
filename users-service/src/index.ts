import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// The SDK will automatically use Google Application Default Credentials on Cloud Run
admin.initializeApp();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Middleware to check App Check token
const checkAppCheck = async (req: Request, res: Response, next: NextFunction) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');

    if (!appCheckToken) {
        // Allow requests to the root path without App Check for health checks
        if (req.path === '/') {
            return next();
        }
        return res.status(401).send('Unauthorized: No App Check token.');
    }

    try {
        await admin.appCheck().verifyToken(appCheckToken);
        return next();
    } catch (err) {
        console.error('Error verifying App Check token:', err);
        return res.status(401).send('Unauthorized: Invalid App Check token.');
    }
};

// Middleware to check authentication
const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            // You can attach user info to the request object if needed
            // (req as any).user = decodedToken;
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
  res.send('Users service is running!');
});

// Protect all user routes with the authentication middleware
const userRouter = express.Router();
// Apply App Check verification first, then Auth verification
userRouter.use(checkAppCheck);
userRouter.use(checkAuth);

// Example user route
userRouter.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // In a real application, you would fetch user data from a database
    res.json({ id, name: `User ${id}`, email: `user${id}@example.com` });
});

app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Users service listening on port ${port}`);
});
