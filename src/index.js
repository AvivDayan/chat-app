const express=require('express');
const http=require('http');
const path=require('path');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {generateMessage,generateLocationMessage}=require('./utils/messages.js');

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const port=process.env.PORT||3000;
const publicFolder=path.join(__dirname,"../public");
app.use(express.static(publicFolder));

io.on('connection',(socket)=>{
    socket.emit('message',generateMessage("Welcome!"));

    socket.broadcast.emit('message',generateMessage('A new user as joined'));
    socket.on('message',(msg,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(msg)){
            return callback("Profane is not allowed");
        }
        io.emit('message',generateMessage(msg));
        callback(); 
    })

    socket.on('disconnect',()=>{
        io.emit('message',generateMessage('A user has left'));
    });

    socket.on('locationMessage',(latitude,longitude,callback)=>{
        socket.broadcast.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`));
        callback();
    })
})



server.listen(port,()=>{console.log(`server is running on port ${port}`)});