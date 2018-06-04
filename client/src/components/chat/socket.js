//Main socket logic
module.exports = function(socket,user1Id,user2Id,room,loadData,add,read){
    socket.on('connect',function(){

        console.log(`User connected to a socket`);

        //Join the room
        socket.emit('join',room,function(err){
            if (err) {
                alert(err) 
            }
            else{
                console.log(`New user connected to room ${room}`);
                loadData(room,user1Id);
            }

            //On receiving message
            socket.on('messageBack',function(message){
                add(message);
                if (user1Id === message.to) {
                    read(message._id);
                }
            })

            //On receiving location
            socket.on('locationBack',function(message){
                add(message);
                if (user1Id === message.to) {
                    read(message._id);
                }
            })
        });
    });
}