require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DbConnect = require('./database');
const router = require('./routes');

const app = express();

const corsOption = {
    credentials: true,
    origin: true,
}

const PORT = process.env.PORT || 5000;
app.use(cors());
app.use('/storage', express.static('storage'));


app.get('/', (req, res) => res.send('Server is running....'));
DbConnect();
app.use(express.json({ limit: '8mb' }));

app.use(router);



app.listen(PORT, () => console.log('Server is running...'));