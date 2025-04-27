const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: true,
});

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
});
