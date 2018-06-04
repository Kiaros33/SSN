const {Message} = require('../models/chat');

module.exports = function(io){
    io.on('connection',(socket)=>{
        console.log('User connected to a socket')
    
        //On join a particular room
        socket.on('join',(room,cb)=>{
            socket.join(room);
            
            //On plain message
            socket.on('message',(message)=>{
                const msg = new Message(message);
                msg.save((err,msg)=>{
                    if (err) {
                        return err
                    }
                    else{
                        io.to(room).emit('messageBack',msg);
                    }
                })
            })
    
            //On location message
            socket.on('createLocationMessage',(message)=>{
                const msg = new Message(message);
                msg.save((err,msg)=>{
                    if (err) {
                        return err
                    }
                    else{
                        io.to(room).emit('locationBack',msg);
                    }
                })
            })
            cb();
        });
    
        //On disconnect
        socket.on('disconnect',()=>{
            console.log('User disconnected')
        })
    })
}
