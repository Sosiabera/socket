const io = require('socket.io')(4100, {
  cors: {
      origin: 'http://localhost:5173',
  },
});

let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((user) => user.userId === userId)) {
      users.push({ userId, socketId });
  }
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
  });

  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      if (user) {
          io.to(user.socketId).emit('getMessage', {
              senderId,
              text,
          });
      }
  });

  socket.emit('me', socket.id);

  socket.on('callUser', (data) => {
      io.to(data.userToCall).emit('callUser', {
          signal: data.signalData,
          from: data.from,
          name: data.name,
      });
      console.log(`Calling user: ${data.userToCall}`);
  });

  socket.on('answerCall', (data) => {
      io.to(data.to).emit('callAccepted', data.signal);
      console.log(`Call answered by: ${data.to}`);
  });

  socket.on('sendCandidate', (data) => {
      io.to(data.to).emit('receiveCandidate', data.candidate);
  });

  socket.on('disconnect-video', () => {
      socket.broadcast.emit('callEnded');
  });

  socket.on('disconnect', () => {
      removeUser(socket.id);
      io.emit('getUsers', users);
      console.log('User disconnected');
  });
});