const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();

const port = 3000;

const cert = fs.readFileSync('./cert/cert.pem');
const key = fs.readFileSync('./cert/key.pem');
const server = https.createServer({ key, cert }, app);

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const gameRoutes = require('./routes/gameRoutes');

app.use('/game', gameRoutes);

app.get('/', (req, res) => {
  res.send('Movie Guessing Game API is running');
});

server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});