const Helpers = require('./helpers/index.js');

exports.handleSocket = (connection, users) => {
  Helpers.log("GREEN", "A user has connected");

  connection.on("message", message => {
    let data;

    Helpers.log("GREEN", "Got a message from user");
    // console.log(message);

    try {
      data = JSON.parse(message);
    } catch (e) {
      Helpers.log("RED", "Invalid JSON message get");
      data = {};
    }

    let conn;

    switch (data.type) {
      case "login":
        Helpers.log("CYAN", "User has logged in:", data.name);
        if (users[data.name]) {
          Helpers.sendTo(connection, {
            type: "login",
            success: false
          });
        } else {
          users[data.name] = connection;
          connection.name = data.name;

          Helpers.sendTo(connection, {
            type: "login",
            success: true
          });
        }
        break;
      case "offer":
        Helpers.log("CYAN", `Sending offer to ${data.name}`);
        conn = users[data.name];
        if (!!conn) {
          connection.otherName = data.name;
          Helpers.sendTo(conn, {
            type: "offer",
            offer: data.offer,
            name: connection.name
          });
        }
        break;
      case "answer":
        //Handle sending socket answers
        Helpers.log("CYAN", `Sending answer to ${data.name}`);
        conn = users[data.name];
        if (!!conn) {
          connection.otherName = data.name;
          Helpers.sendTo(conn, {
            type: "answer",
            answer: data.answer
          });
        }
        break;
      case "candidate":
        //Handle ICE candidates between users
        Helpers.log("CYAN", `Sending ICE candidate to ${data.name}`);
        conn = users[data.name];
        if (!!conn) {
          Helpers.sendTo(conn, {
            type: "candidate",
            candidate: data.candidate
          });
        }
        break;
      case "leave":
        Helpers.log("YELLOW", `User is leaving ${data.name}`);
        conn = users[data.name];
        if (!!conn) {
          Helpers.sendTo(conn, { type: "leave" });
        }
        break;
      case "instantMessage":
        Helpers.log('YELLOW', `User is sending message to ${data.name}`);
        conn = users[data.name];
        if (!!conn) {
          Helpers.sendTo(conn, { type: 'instantMessage', message: data.message });
        }
        break;
      default:
        Helpers.sendTo(connection, {
          type: "error",
          message: `Command ${data.type} not supported.`
        });
        break;
    }
  });

  connection.on("close", () => {
    Helpers.log("YELLOW", "User has left");
    if (connection.name) {
      delete users[connection.name];

      if (connection.otherName) {
        Helpers.log("YELLOW", `Disconnecting from ${connection.otherName}`);
        let conn = users[connection.otherName];
        conn.otherName = null;
        if (!!conn) {
          Helpers.sendTo(conn, { type: "leave" });
        }
      }
    }
  });

  connection.send(JSON.stringify({ type: 'serverMessage', message: "server does not care, but say hello anyway"}));
};