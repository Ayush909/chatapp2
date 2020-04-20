const path = require('path');
const http = require('http');
const express = require('express');
const formatMessage = require('./utils/message');
const {userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const app = express();
const socketio = require('socket.io');

const server = http.createServer(app);

const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));

const botname = 'Dechat Bot';

io.on('connection', socket=>{

    //join Room
    socket.on('joinRoom', ({username,room})=>{

        const user = userJoin(socket.id, username , room);

        socket.join(user.room);

        //Welcome message to the user only
        socket.emit('message', formatMessage(botname,'Welcome to Chatcord'));

        //Notifies all users when a new user connects except the user that connects
        socket.broadcast
        .to(user.room)
        .emit(
            'message',formatMessage(botname,`${user.username} has joined the chat.`)
        );

        //sending users and room info to client page
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });
        
    //Listen to chatMessage
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    //Notifies all users when a user disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`));
        }
        //sending users and room info to client page
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    })


})

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`);
})