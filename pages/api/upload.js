const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');

const photoData = []; 

const app = express();
app.use(cors());

const httpServer = app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT'] 
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('updatePhotos', photoData);

  socket.on("like", ({ index, photo }) => {
    photoData[index] = photo;
    console.log("Like event received. Updated photoData:", photoData);
    io.emit("updatePhotos", photoData); 
  });

  socket.on("comment", ({ index, photo }) => {
    photoData[index] = photo;
    console.log("Comment event received. Updated photoData:", photoData);
    io.emit("updatePhotos", photoData); 
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});