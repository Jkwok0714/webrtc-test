const express = require('express');
const app = express();
const path = require('path');
const WebSocketServer = require('ws').Server;

const Helpers = require('./helpers/index.js');
const handleSocket = require('./socket.js').handleSocket;

const PORT_NUMBER = 3000;
const SOCKET_PORT = 9090;

//Local cache storage
let users = {};

//Express server
const STATIC_PATH = path.join(__dirname, "/../build/");

app.use(express.static(STATIC_PATH));

app.use((req, res, next) => {
    Helpers.log('CYAN', 'Getting request', req.method, req.url);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../build/index.html'));
});

app.listen(PORT_NUMBER, () => Helpers.log('CYAN', 'Application listening on port', PORT_NUMBER, 'serving static from', STATIC_PATH));

//WS server
let wss = new WebSocketServer({ port: SOCKET_PORT });

wss.on('connection', (connection) => handleSocket(connection, users));