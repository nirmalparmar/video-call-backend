require('dotenv').config();
const express = require("express");
const socket = require('socket.io');
const { static } = require('express');
let port = process.env.PORT || 5000;
// let socketsArray = [];
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
})

const server = app.listen(port, () =>{
    console.log("Listening on port" + port);
})

const io = socket(server);

io.on('connection', (socket) => {
    socket.broadcast.emit('add-user', {
        userId: socket.id
    });

    socket.on('disconnect', () => {
        socketsArray.splice(socketsArray.indexOf(socket.id), 1);
        io.emit('remove-user', socket.id);
    });

    socket.on('make-offer', (data) => {
        socket.to(data.to).emit('offer-made', {
            offer: data.offer,
            socket: socket.id
        });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        });
    });

});