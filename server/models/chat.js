const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    roomId:{
        type:String,
        required:true
    },
    message:{
        text: { 
            type:String, 
            required:true 
        }
    },
    to: {
        type:String, 
        required:true 
    },
    from: {
        type:String,
        required:true 
    },
    image: {
        type:String,
        required:true
    },
    location: {
        type:Boolean,
        default:false
    },
    read: {
        type:Boolean,
        default:false
    }
},
{
    timestamps: true
});

const Message = mongoose.model('Message',messageSchema);

module.exports = {Message}