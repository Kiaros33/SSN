const {User} = require('../models/user');
const {Message} = require('../models/chat');
const {auth} = require('../middleware/auth');

module.exports = function(app){


    // USER LOGOUT //
    app.get('/api/logout',auth,(req,res,next)=>{

        //Use custom method from user model to delete JWToken
        req.user.delToken(req.token,(err,user)=>{
            if (err) return next(err);
            res.sendStatus(200)
        })
    })


    // GET USER INFO IF AUTHENTICATED //
    app.get('/api/users/user',auth,(req,res,next)=>{
        return res.json({
            isAuth:true,
            id:req.user._id,
            nickname:req.user.nickname,
            email:req.user.email,
            image:req.user.image,
            friends:req.user.friends,
            inRequests:req.user.inRequests,
            outRequests:req.user.outRequests
        })
    })


    // GET POTENTIAL FRIEND INFO BY E-MAIL //
    app.get('/api/users/:email',auth,(req,res,next)=>{
        User.findOne({'email':req.params.email}).exec()
        .then(friend => {
            if (!friend) return res.json({
                searchSuccess:false,
                message:'E-mail not found'
            });

            return res.json({
                searchSuccess:true,
                user:{
                    id:friend._id,
                    image:friend.image,
                    nickname:friend.nickname
                }
            })
        })
        .catch(err => {
            next(err)
        })
    })


    // GET ALL REQUESTS OF CURRENT USER //
    app.get('/api/users/:id/friend-requests',(req,res,next)=>{
        User.find({inRequests:req.params.id}).select({nickname:1,image:1}).exec()
        .then(outReq => {
            User.find({outRequests:req.params.id}).select({nickname:1,image:1}).exec()
            .then(inReq => {
                return res.json({
                    outReq,
                    inReq
                })
            })
            .catch(err => {
                next(err)
            })
        })
        .catch(err => {
            next(err)
        })
    })


    // GET ALL FRIENDS OF CURRENT USER AND CHECK FOR NEW MESSAGES FROM THEM//
    app.get('/api/users/:id/friends',(req,res,next)=>{

        //Find user friends
        User.find({friends:req.params.id}).select({nickname:1,image:1}).exec()
        .then(friends => {

            //Check if have unread messages from them
            Message.find({to:req.params.id,read:false}).select({from:1,_id:0}).exec()
            .then(messages => {
                return res.status(200).json({
                    friends,
                    messages
                })
            })
            .catch(err => {
                next(err)
            })
        })
        .catch(err => {
            next(err)
        })
    })


    // LOAD INITIAL DATA OF THE CHAT ROOM //
    app.get('/api/chats/:id',(req,res,next)=>{
        let id = req.params.id;
        let user = req.query.user;

        //Make all messages to user read
        Message.update({to:user,read:false,roomId:id},{read:true},{multi:true})
        .catch(err => {
            next(err)
        })
        
        //Find all messages in the room and return
        Message.find({roomId: id}).sort({createdAt:'desc'}).limit(35)
        .then(msglist => {
            msglist.reverse();
            return res.send(msglist);
        })
        .catch(err => {
            next(err)
        }) 
    })
}