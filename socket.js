const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const Socket = require("socket.io");
const io = Socket(server, { cors: { origin: "*" } });
const cors = require("cors");

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

app.use(cors({ origin: "*" }));

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("send-request", (data) => {
    io.to(data.to).emit("receive-request", data.updatedUser);
  });

  socket.on("accept-request", (data) => {
    io.to(data.to).emit("request-accepted", {
      me: data.me,
      friend: data.friend,
    });
  });

  socket.on("reject-request", (data) => {
    io.to(data.to).emit("request-rejected", {
      friend: data.friend,
      me: data.me,
    });
  });

  socket.on("send-message", (data) => {
    io.to(data.to).emit("receive-message", { newMessage: data.newMessage });
  });

  socket.on("logout", () => {
    socket.disconnect();
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(5000, () => {
  console.log("Socket server now running on port 5000");
});
