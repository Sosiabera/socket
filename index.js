const io = require("socket.io")(4100, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let users = [];
let usersV = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const addUserV = (userId, socketId) => {
  !usersV.some((user) => user.userId === userId) &&
  usersV.push({ userId, socketId });
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const getUserV = (userId) => {
  return usersV.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const removeUserV = (socketId) => {
  usersV = usersV.filter((user) => user.socketId !== socketId);
};


io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("addUserVideo", (userId) => {
    addUserV(userId, socket.id);
    io.emit("getUsers", usersV);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text
      });
    }
  });

  socket.on("callUser", (data) => {
    const user = getUserV(data.userToCall);
    if (user) {
      io.to(user.socketId).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    }
  });

  socket.on("answerCall", (data) => {
    const user = getUserV(data.to);
    if (user) {
      io.to(user.socketId).emit("callAccepted", data.signal);
    }
  });

  socket.on("disconnect-video", () => {
    socket.broadcast.emit("callEnded");
    console.log("disconnected vido")
  });

  socket.on("disconnectVideo", () => {
    removeUserV(socket.id);
    io.emit("getUsers", users);
    console.log("disconnected")
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("disconnected")
  });
});
