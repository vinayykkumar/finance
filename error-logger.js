import express from 'express';
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to receive error logs
app.post('/log', (req, res) => {
    console.error('Browser Error:', req.body);
    res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Error logging server is running on http://localhost:${PORT}`);
});