
import express, { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import 'dotenv/config';
import multer from 'multer';

// Initialize Firebase Admin SDK with explicit project ID and bucket
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'studio-3300538966-77056',
        storageBucket: 'studio-3300538966-77056.appspot.com',
    });
}

const app = express();
const port = parseInt(process.env.PORT || '8087', 10);

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Get storage bucket from initialized admin app
const bucket = admin.storage().bucket();

// Multer configuration for memory storage
const multerMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});


// Extend Express Request type
interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// Authentication middleware
const checkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            return res.status(401).send('Unauthorized');
        }
    }
    return res.status(401).send('Unauthorized');
};

app.get('/', (req: Request, res: Response) => {
  res.send('Storage service is running!');
});

// Storage routes
const storageRouter = express.Router();
storageRouter.use(checkAuth);

// File upload endpoint
storageRouter.post('/upload', multerMemory.single('file'), (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.uid;
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    
    // Create a path for the file in GCS
    const filePath = `${userId}/${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(filePath);
    
    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => {
        console.error('Blob stream error:', err);
        res.status(500).send({ message: 'Could not upload the file.' });
    });

    blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        res.status(200).send({
            message: 'File uploaded successfully.',
            url: publicUrl,
        });
    });

    blobStream.end(req.file.buffer);
});


app.use('/storage', storageRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Storage service listening on port ${port}`);
});
