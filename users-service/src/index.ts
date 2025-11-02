import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Users service is running!');
});

// Example user route
app.get('/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // In a real application, you would fetch user data from a database
    res.json({ id, name: `User ${id}`, email: `user${id}@example.com` });
});

app.listen(port, () => {
  console.log(`Users service listening on port ${port}`);
});
