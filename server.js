const express = require('express');
const app = express();
const port = 3000;

require('dotenv').config();

app.use(express.json());
app.use(express.static("public"));

const gameRoutes = require('./routes/gameRoutes');

app.use('/game', gameRoutes);

app.get('/', (req, res) => {
  res.send('Movie Guessing Game API is running');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});