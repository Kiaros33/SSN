const {User} = require('../models/user');
const {Message} = require('../models/chat');
const {auth} = require('../middleware/auth');
const axios = require('axios');

module.exports = function(app){
    
    /*-------------------- USERS REQUESTS -------------------- */

    // USER REGISTER //
    app.post('/api/users/:id',(req,res,next)=>{
        const user = new User({
            email:req.params.id,
            password:req.body.password,
            nickname:req.body.nickname
        });

        user.save()
        .then(user => {
            return res.status(200).json({
                success:true,
                user
            });
        })
        .catch(err => {
            next(err)
        })
    })


    // USER LOGIN //
    app.post('/api/login/',(req,res,next)=>{
        User.findOne({'email': req.body.email}).exec()
        .then(user => {
            if (!user) return res.json({isAuth:false,message:'E-mail not found'});

            //Use custom method from user model to compare passwords
            user.comparePasswords(req.body.password,(err,isMatch)=>{
                if (!isMatch) return res.json({
                    isAuth:false,
                    message:'Wrong password'
                });

                //Use custom method from user model to generate JWToken
                user.genToken((err,user)=>{
                    if (err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth:true,
                        id:user._id,
                        nickname:user.nickname,
                        email:user.email,
                        image:user.image
                    })
                })
            })
        })
        .catch(err => {
            next(err)
        })
    })


    // FRIEND INVITE //
    app.post('/api/users/:id/friend-requests/:request_id',auth,(req,res,next)=>{
        let userOutId = req.params.id;
        let userInId = req.params.request_id;

        //Can not be done if requested user equal to user that make request
        if (userOutId.toString()===userInId.toString()) {
            return res.json({
                outReqSuccess:false,
                message:"This person is you"
            })
        };

        //Find user who make request to become friends
        User.findById(userOutId).exec()
        .then(userOut => {

            //Find user who receive request to become friends
            User.findById(userInId).exec()
            .then(userIn => {

                //Can not be done if already friends or request is exists  
                if (userOut.outRequests.includes(userInId) || userOut.friends.includes(userInId) || userOut.inRequests.includes(userInId)) {
                    return res.json({
                        outReqSuccess:false,
                        message:"This person is already your friend or requested to be your friend"
                    })
                }

                //Add requests to both users
                userIn.inRequests.push(userOutId);
                userOut.outRequests.push(userInId);

                //Save changes
                Promise.all([userOut.save(), userIn.save()])
                .then(users => {
                    return res.json({
                        outReqSuccess:true
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
        .catch(err => {
            next(err)
        })
    });


    // ACCEPT FRIEND REQUEST //
    app.post('/api/users/:id/friends/:friend_id',auth,(req,res,next)=>{
        let curUserId = req.params.id;
        let reqUserId = req.params.friend_id;

        //Find user who wants to cancel request
        User.findById(curUserId).exec()
        .then(curUser => {

            //Find user who have the request as incoming
            User.findById(reqUserId).exec()
            .then(reqUser => {
                //Add users to each other as friends
                //Remove old requests from both users
                reqUser.friends.push(curUserId);
                reqUser.outRequests.pull(curUserId);
                curUser.friends.push(reqUserId);
                curUser.inRequests.pull(reqUserId);

                Promise.all([curUser.save(), reqUser.save()])
                .then(users => {
                    return res.json({
                        isAuth:true,
                        id:users[0]._id,
                        nickname:users[0].nickname,
                        email:users[0].email,
                        image:users[0].image,
                        friends:users[0].friends,
                        inRequests:users[0].inRequests,
                        outRequests:users[0].outRequests
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
        .catch(err => {
            next(err)
        })
    });


    // GOOGLE SIGN-UP-IN //
    app.post('/api/google',(req,res,next)=>{
        
        //Make verification on google
        axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`)
        .then(({data})=>{
            if (data.email && data.email_verified) {
                
                //Find if user with that e-mail already exists
                User.findOne({'email':data.email}).exec((err,user)=>{
                    if (!user) {
                        const user = new User({
                            email: data.email,
                            nickname: data.given_name ? data.given_name : 'NoName',
                            password: data.jti + data.at_hash,
                            image: data.picture
                        });

                        //Register new user if not exists
                        user.save()
                        .then(user => {

                            //Login new user after registered
                            user.genToken((err,user)=>{
                                if (err) return res.status(400).send(err);
                                res.cookie('auth',user.token).json({
                                    isAuth:true,
                                    id:user._id,
                                    nickname:user.nickname,
                                    email:user.email,
                                    image:user.image
                                })
                            })
                        })
                        .catch(err => {
                            next(err)
                        })
                    }
                    else{

                        //Login user if already exists
                        user.genToken((err,user)=>{
                            if (err) return res.status(400).send(err);
                            res.cookie('auth',user.token).json({
                                isAuth:true,
                                id:user._id,
                                nickname:user.nickname,
                                email:user.email,
                                image:user.image
                            })
                        })
                    }         
                })
            }
        })
    })
}