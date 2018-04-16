const express = require('express');
const app = express();
const path = require('path');

const PORT_NUMBER = 3333;

const STATIC_PATH = path.join(__dirname, "/../build/");

app.use(express.static(STATIC_PATH));

app.use((req, res, next) => {
    console.log('Getting request', req.method, req.url);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../build/index.html'));
});

app.listen(PORT_NUMBER, () => console.log('Application listening on port', PORT_NUMBER, 'serving static from', STATIC_PATH));