import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Businesses service is running!');
});

// Example business route
app.get('/businesses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // In a real application, you would fetch business data from a database
    res.json({ id, name: `Business #${id}`, address: '123 Main St' });
});

app.listen(port, () => {
  console.log(`Businesses service listening on port ${port}`);
});
