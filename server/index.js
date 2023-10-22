const express = require("express");
const app = express();
const httpp = require("http");
const { loadavg } = require("os");
const { Server } = require("socket.io");
const server = httpp.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let lobbies = [];
let users = [];
io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("createLobby", (data) => {
    lobbies.push(data);
    io.emit("getLobby", lobbies);
  });

  socket.emit("lobbies", lobbies);
  socket.on("joinParty", (data) => {
    const findExistingUser = users.find((el) => el.username == data.username);
    if (findExistingUser) {
      users = users.filter((el) => el.username != findExistingUser.username);
    }
    socket.join(data.id);
    console.log(`User : ${socket.id} has joined party ${data.id}`);
    users.push({
      roomId: data.id,
      socketId: socket.id,
      username: data.username,
      points: 0,
    });

    const username = data.username;

    const lobbyData = lobbies.find((el) => el.id == data.id);
    io.to(data.id).emit("users", { users, lobbyData, username });
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.partyId).emit("getMessages", data);
  });

  socket.on("sendCanvas", (data) => {
    socket.to(data.params.id).emit("loadCanvas", data.data);
  });

  socket.on("actionCanvas", (data) => {
    io.to(data.params.id).emit("getActionCanvas", data.type);
  });

  socket.on("disconnect", () => {
    if (users.length != 0) {
      const user = users.find((el) => el.socketId == socket.id);
      if (user) {
        users = users.filter((el) => el.socketId != socket.id);
        io.to(user.roomId).emit("getUserLeft", { users, user });
      }
    }
  });

  socket.on("rounds", ({ round, params, lobby }) => {
    console.log(lobby);
    const maxRounds = lobby.rounds;
    // console.log(maxRounds);
    io.to(params.id).emit("roundStatus", { round, maxRounds });
  });

  socket.on("wordToGuess", ({ wordToGuess, params }) => {
    socket.to(params.id).emit("word", wordToGuess);
  });

  socket.on("gameDone", (params) => {
    lobbies = lobbies.map((el) =>
      el.id == params.id ? { ...el, status: "F" } : el
    );
    let lobbyData = lobbies.find((el) => el.id == params.id);
    lobbyData.status = "F";
    io.to(params.id).emit("lobbies", lobbyData);
  });
  socket.on("wordGuessed", ({ params, clientWord }) => {
    users = users.map((el) =>
      el.username == params.username ? { ...el, points: el.points + 10 } : el
    );
    socket.emit("word", clientWord);
    io.to(params.id).emit("foundFirst");
    io.to(params.id).emit("userPoints", users);
    socket.to(params.id).emit("notification", params.username);
  });

  socket.on("wordGuessedAfter", ({ params, clientWord }) => {
    users = users.map((el) =>
      el.username == params.username ? { ...el, points: el.points + 7 } : el
    );
    socket.emit("word", clientWord);
    io.to(params.id).emit("userPoints", users);
    socket.to(params.id).emit("notification", params.username);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
