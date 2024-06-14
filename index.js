
const io = require("socket.io")(4100, {
    cors: {
      origin: "http://localhost:5173",
    },
  })
let user =[]

const addUser = (userId, socketId) => {
    !user.some((user) => user.userId === userId) && user.push({ userId, socketId })
  }

  const getUser = (userId) => {
    return user.find((user) => user.userId === userId)
  }

  const removeUser = (socketId) => {
    user = user.filter((user) => user.socketId !== socketId)
  }
  
  io.on("connection", (socket) => {
    console.log("user connected")
    socket.on("addUser" , userId=>{
        addUser(userId, socket.id)
        io.emit("getUsers", user)
    })

    //send and get message
    socket.on("sendMessage", ({senderId, receiverId, text}) => {
        const user = getUser(receiverId)
        io.to(user.socketId).emit("getMessage", {
            senderId, text
        })
    })

    socket.on("disconnect", () => {
        removeUser(socket.id)
        io.emit("getUsers", user)
    }) 
  });