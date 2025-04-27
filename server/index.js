const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: true,
});

const nameToSocketIdMap = new Map();
const socketIdToNameMap = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("online-me", (payload) => {
    const { me } = payload;
    nameToSocketIdMap.set(me, socket.id);
    socketIdToNameMap.set(socket.id, me);
    console.log("User Online", me);
  });

  socket.on("call-1", (payload) => {
    const { name } = payload;
    const socketId = nameToSocketIdMap.get(name);
    console.log(name, nameToSocketIdMap);

    if (!socketId) {
      return io.to(socket.id).emit("offline", payload);
    }

    io.to(socketId).emit("calling", payload);
  });

  socket.on("room:join", (payload) => {
    const { me, name, room } = payload;

    const socketId = nameToSocketIdMap.get(name);
    io.to(room).emit("user:joined", { name, id: socketId });
    io.to(room).emit("user:joined", { name: me, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", {
      me,
      name,
      room,
      mySocket: socket.id,
      otherSocket: socketId,
    });
    io.to(socketId).emit("room:join", {
      me: name,
      name: me,
      room,
      otherSocket: socket.id,
      mySocket: socketId,
    });
  });

  socket.on("sendOffer", (payload) => {
    const { to, offer } = payload;

    io.to(to).emit("incomingOffer", { from: socket.id, offer });
  });

  socket.on("sendAnswer", (payload) => {
    const { to, ans } = payload;
    console.log("answer sending", ans);
    io.to(to).emit("ansAccepted", { from: socket.id, ans });
  });
});
