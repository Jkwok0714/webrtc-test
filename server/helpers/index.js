const COLORS = {
  GREEN: "\x1b[32m",
  WHITE: "\x1b[37m",
  RED: "\x1b[31m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m"
};

exports.log = (color, ...message) => {
    let colorCode = COLORS[color] || COLORS['WHITE'];
    console.log(colorCode, message.join(" "), "\x1b[0m");
}

exports.sendTo = (connection, message) => {
  connection.send(JSON.stringify(message));
}