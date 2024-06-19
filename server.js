const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get data from local file
app.get('/api/data', (req, res) => {
    fs.readFile(path.join(__dirname, 'db/yt/arr.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
