const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');

let photoData = []; 

const app = express();
app.use(cors());

const httpServer = app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'] 
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on("like", ({ index, photo }) => {
    photoData[index] = photo;
    io.emit("updateLikesAndComments", photoData); 
  });

  socket.on("comment", ({ index, photo }) => {
    photoData[index] = photo;
    io.emit("updateLikesAndComments", photoData); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});