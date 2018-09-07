const express = require('express');
const app = express();
const path = require('path');

const https = require('https');

const fs = require('fs');

const WebSocketServer = require('ws').Server;

const Helpers = require('./helpers/index.js');
const handleSocket = require('./socket.js').handleSocket;

const PORT_NUMBER = 3007;
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

// app.listen(PORT_NUMBER, () => Helpers.log('CYAN', 'Application listening on port', PORT_NUMBER, 'serving static from', STATIC_PATH));

Helpers.log(
  "CYAN",
  "Application listening on port",
  PORT_NUMBER,
  "serving static from",
  STATIC_PATH
);

let httpsServer = https
  .createServer(
    {
      key: fs.readFileSync("keys/private.key"),
      cert: fs.readFileSync("keys/server.crt")
    },
    app
  );

httpsServer.listen(PORT_NUMBER);

//WS server
let wss = new WebSocketServer({ server: httpsServer });

wss.on('connection', (connection) => handleSocket(connection, users));
