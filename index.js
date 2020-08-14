require('dotenv').config();
const express = require("express");
const socket = require('socket.io');
const { static } = require('express');
let port = process.env.PORT || 5000;
let users = [];
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
    users.push(socket.id)
    socket.broadcast.emit('add-user', {
        users:[socket.id]
    })

    socket.on('disconnect', () => {
        // users.splice(this.socketsArray.indexOf(socket.id), 1);
        io.emit('remove-user', socket.id);
    });

    socket.on('make-offer', (data) => {
        socket.to(data.to).emit('offer-made', {
            offer:data.offer,
            id:socket.id
        })
    })

    socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
            answer:data.answer,
            id:socket.id
        })
    })
})
