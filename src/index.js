const express=require('express');
const http=require('http');
const path=require('path');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {generateMessage,generateLocationMessage}=require('./utils/messages.js');
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/users');
const app=express();
const server=http.createServer(app);
const io=socketio(server);

const port=process.env.PORT||3000;
const publicFolder=path.join(__dirname,"../public");
app.use(express.static(publicFolder));

io.on('connection',(socket)=>{

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({
            id:socket.id,
            username,
            room
        })
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message',generateMessage("Admin",`Hello ${user.username}, Welcome!`));
        socket.broadcast.to(user.room).emit('message',generateMessage("Admin",`${user.username} as joined`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback();

        //4 types of emits

        //socket.emit, io.emit, socket.broadcast.emit, io.to.emit socket.to.broadcast 
    })


    socket.on('message',(msg,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(msg)){
            return callback("Profanity is not allowed");
        }
        const user=getUser(socket.id);
        io.to(user.room).emit('message',generateMessage(user.username,msg));
        callback(); 
    })
 
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage("Admin",`${user.username} has left`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    });

    socket.on('locationMessage',(latitude,longitude,callback)=>{
        const user=getUser(socket.id);
        socket.to(user.room).broadcast.emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`));
        callback();
    })
})



server.listen(port,()=>{console.log(`server is running on port ${port}`)});