const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);
const {User} = require('./models/user');
const {Message} = require('./models/chat');
const {auth} = require('./middleware/auth');
const fs = require('fs');
const formidable = require('formidable');
const axios = require('axios');
const AWS = require('aws-sdk');

//Multer for make data readable
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })

//Express on
const app = express();

//Specify region for storage
AWS.config.region = 'us-east-1'

//Create through http for socketIO
const server = http.createServer(app);

//Connect socketIO
const io = socketIO(server);

//Set mongoose promise
mongoose.Promise = global.Promise;

//Connect to DB
mongoose.connect(config.DATABASE);

//Set additional middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('client/build'));


/*-------------------- SOCKET LOGIC -------------------- */
//On new connection
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


/*-------------------- CHAT REQUESTS -------------------- */

// LOAD INITIAL DATA OF THE CHAT ROOM //
app.get('/api/loadInitialData',(req,res)=>{
    let room = req.query.room;
    let user = req.query.user;

    //Make all messages to user read
    Message.update({to:user,read:false,roomId:room},{read:true},{multi:true},(err,res)=>{
        if (err) return res.status(400).send(err);
    })

    //Find all messages in the room and return
    Message.find({roomId: room}).sort({createdAt:'desc'}).limit(35).exec((err,msglist)=>{
        if (err) return res.status(400).send(err);
        msglist.reverse();
        res.send(msglist);
    })    
})


// MAKE MESSAGE READ //
app.post('/api/readMessage',(req,res)=>{
    Message.findByIdAndUpdate(req.body.message._id,{read:true},(err,message)=>{
        if (err) return res.status(400).send(err);
        res.json({
            read:true
        })
    })
})



/*-------------------- USER REQUESTS -------------------- */

// USER REGISTER //
app.post('/api/register',(req,res)=>{
    const user = new User(req.body);

    user.save((err,user)=>{
        if (err) return res.json({
            success:false,
            err
        });
        res.status(200).json({
            success:true,
            user
        })
    })
})

// USER EDIT //
app.post('/api/editUser',auth,(req,res)=>{
    let file = req.body.file;

    //Find user by id
    User.findById(req.body.id,(err,user)=>{
        if (err) return res.status(400).json({
            err
        });

        //Set changes
        user.nickname = req.body.nickname ? req.body.nickname : user.nickname;
        user.password = req.body.password ? req.body.password : user.password;
        user.image = req.body.image ? req.body.image : user.image;
        
        //Apply changes
        user.save((err,user)=>{
            if (err) return res.json({
                success:false,
                isAuth:true,
                err
            });
            return res.status(200).json({
                success:true,
                isAuth:true,
                id:user._id,
                nickname:user.nickname,
                email:user.email,
                image:user.image
            })
        })

    });
});


// USER LOGIN //
app.post('/api/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{
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
})

// USER LOGOUT //
app.get('/api/logout',auth,(req,res)=>{

    //Use custom method from user model to delete JWToken
    req.user.delToken(req.token,(err,user)=>{
        if (err) return res.status(400).send(err);
        res.sendStatus(200)
    })
})

// GET USER INFO BY ID //
app.get('/api/getUser',(req,res)=>{
    let id = req.query.id;
    User.findById(id,(err,user)=>{
        if (!user) return res.status(400).json({
            message:"User not found"
        })
        res.status(200).json({
            nickname:user.nickname,
            email:user.email,
            image:user.image
        })
    })
})

// GET USER INFO IF AUTHENTICATED //
app.get('/api/isAuth',auth,(req,res)=>{
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

// USER IMAGE UPLOAD //
app.post('/api/upload',upload.single('image'),(req,res,next)=>{
    let file = req.file
    if (!file) {
        return res.json({
            success:true
        });
    }
    if (file.size>3145728) {
        return res.json({
            success:false
        });
    }
    let s3 = new AWS.S3({
        accessKeyId: config.IAM_USER_KEY,
        secretAccessKey: config.IAM_USER_SECRET,
        Bucket: config.BUCKET_NAME
    });
    let bodystream = fs.createReadStream(file.path);
    let params = {
        Bucket: config.BUCKET_NAME,
        Key: file.destination + file.originalname,
        Body: bodystream,
        ContentType: file.mimetype,
        CacheControl: "no-cache",
        ACL:'public-read'
    };
    s3.putObject(params, function(err, data) {
        if (err) return res.json({
            success:false,
            err
        }) 
        else {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.log(err)
            }
            return res.json({
                success:true
            });
        }
    });

    //Uploading file using formidable / set some restrictions
    // const form = new formidable.IncomingForm();
    // form.maxFileSize = 3 * 1024 * 1024;
    // form.uploadDir = path.join(__dirname,'../client/public/uploads');

    // form.parse(req, (err, field, file)=>{
    //     if (err) return res.json({
    //         success:false,
    //         err
    //     })
    // });

    // form.on('file', (field,file)=>{
    //     if(file.type.split("/")[0] !== 'image'){
    //         fs.rename(file.path,'new_path',(err)=>{
    //             if (err) return res.json({
    //                 success:false,
    //                 err
    //             })
    //         });
    //     }
    //     else{
    //         fs.rename(file.path,path.join(form.uploadDir,file.name),(err)=>{
    //             if (err) return res.json({
    //                 success:false,
    //                 err
    //             })
    //         });
    //     }
        
    // });

    // form.on('end', ()=>{
    //     res.json({
    //         success:true
    //     });
    // });
})

// GET POTENTIAL FRIEND INFO BY E-MAIL //
app.get('/api/friendSearch',auth,(req,res)=>{
    User.findOne({'email':req.query.email},(err,friend)=>{
        if (!friend) return res.json({
            searchSuccess:false,
            message:'E-mail not found'
        });
        else{
            return res.json({
                searchSuccess:true,
                user:{
                    id:friend._id,
                    image:friend.image,
                    nickname:friend.nickname
                }
            })
        }
    })
})

// FRIEND INVITE //
app.post('/api/friendInvite',auth,(req,res)=>{
    let userOutId = req.body.userOut;
    let userInId = req.body.userIn;

    //Find user who make request to become friends
    User.findById(userOutId,(err,userOut)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            //Find user who receive request to become friends
            User.findById(userInId,(err,userIn)=>{
                if (err) return res.status(400).json({
                    err
                });

                //Can not be done if requested user equal to user that make request
                else if (userOut._id.toString()===userIn._id.toString()) {
                    return res.json({
                        outReqSuccess:false,
                        outReqMessage:"This person is you"
                    })
                }

                //Can not be done if already friends or request is exists  
                else if (userOut.outRequests.includes(userInId) || userOut.friends.includes(userInId) || userOut.inRequests.includes(userInId)) {
                    return res.json({
                        outReqSuccess:false,
                        outReqMessage:"This person is already your friend or requested to be your friend"
                    })
                }

                else{
                    //Add requests to both users
                    userIn.inRequests.push(userOutId)
                    userOut.outRequests.push(userInId);
                    userOut.save((err,userOut)=>{
                        if (err) return res.json({
                            outReqSuccess:false,
                            err
                        });
                        userIn.save((err,userIn)=>{
                            if (err) return res.json({
                                outReqSuccess:false,
                                err
                            });
                            return res.json({
                                outReqSuccess:true
                            })
                        })
                    })
                }
            });
        }
    });
});

// GET ALL USERS THAT HAVE INCOME REQUEST FROM CURRENT USER //
app.get('/api/getAllOut',(req,res)=>{
    User.find({inRequests:req.query.userId}).select({nickname:1,image:1}).exec((err,users)=>{
        if (err) {
            return res.json({
                getAllOut:false,
                err
            })
        }
        return res.status(200).json({
            users
        })
    })
})

// GET ALL INCOME REQUESTS OF CURRENT USER //
app.get('/api/getAllIn',(req,res)=>{
    User.find({outRequests:req.query.userId}).select({nickname:1,image:1}).exec((err,users)=>{
        if (err) {
            return res.json({
                getAllIn:false,
                err
            })
        }
        return res.status(200).json({
            users
        })
    })
})

// CANCEL OUT REQUEST //
app.post('/api/cancelOut',auth,(req,res)=>{
    let curUserId = req.body.curUser;
    let reqUserId = req.body.reqUser;

    //Find user who wants to cancel request
    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            //Find user who have the request as incoming
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });

                else{
                    //Remove requests from both users
                    reqUser.inRequests.pull(curUserId);
                    curUser.outRequests.pull(reqUserId);
                    curUser.save((err,curUser)=>{
                        if (err) return res.json({
                            outReqCanceled:false,
                            err
                        });
                        reqUser.save((err,reqUser)=>{
                            if (err) return res.json({
                                outReqCanceled:false,
                                err
                            });
                            return res.json({
                                isAuth:true,
                                id:curUser._id,
                                nickname:curUser.nickname,
                                email:curUser.email,
                                image:curUser.image,
                                friends:curUser.friends,
                                inRequests:curUser.inRequests,
                                outRequests:curUser.outRequests
                            })
                        })
                    })
                }
            });
        }
    });
});

// CANCEL IN REQUEST //
app.post('/api/cancelIn',auth,(req,res)=>{
    let curUserId = req.body.curUser;
    let reqUserId = req.body.reqUser;

    //Find user who wants to reject incoming request
    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            //Find user who made the request
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });

                else{
                    //Remove requests from both users
                    reqUser.outRequests.pull(curUserId);
                    curUser.inRequests.pull(reqUserId);
                    curUser.save((err,curUser)=>{
                        if (err) return res.json({
                            inReqCanceled:false,
                            err
                        });
                        reqUser.save((err,reqUser)=>{
                            if (err) return res.json({
                                inReqCanceled:false,
                                err
                            });
                            return res.json({
                                isAuth:true,
                                id:curUser._id,
                                nickname:curUser.nickname,
                                email:curUser.email,
                                image:curUser.image,
                                friends:curUser.friends,
                                inRequests:curUser.inRequests,
                                outRequests:curUser.outRequests
                            })
                        })
                    })
                }
            });
        }
    });
});

// ACCEPT IN REQUEST //
app.post('/api/acceptIn',auth,(req,res)=>{
    let curUserId = req.body.curUser;
    let reqUserId = req.body.reqUser;

    //Find user who wants to accept incoming request
    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });
        

        else{
            //Find user made the request
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });
                
                else{
                    //Add users to each other as friends
                    //Remove old requests from both users
                    reqUser.friends.push(curUserId);
                    reqUser.outRequests.pull(curUserId);
                    curUser.friends.push(reqUserId);
                    curUser.inRequests.pull(reqUserId);
                    
                    curUser.save((err,curUser)=>{
                        if (err) return res.json({
                            inReqAccepted:false,
                            err
                        });
                        reqUser.save((err,reqUser)=>{
                            if (err) return res.json({
                                inReqAccepted:false,
                                err
                            });
                            return res.json({
                                isAuth:true,
                                id:curUser._id,
                                nickname:curUser.nickname,
                                email:curUser.email,
                                image:curUser.image,
                                friends:curUser.friends,
                                inRequests:curUser.inRequests,
                                outRequests:curUser.outRequests
                            })
                        })
                    })
                }
            });
        }
    });
});


// DELETE FROM FRIENDS //
app.post('/api/deleteFriend',auth,(req,res)=>{
    let curUserId = req.body.curUser;
    let friendId = req.body.friend;

    //Find user who wants to delete a friend
    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            //Find user wanted to be deleted
            User.findById(friendId,(err,friend)=>{
                if (err) return res.status(400).json({
                    err
                });
                
                else{
                    //Remove from friends from both users
                    friend.friends.pull(curUserId);
                    curUser.friends.pull(friendId);
                    curUser.save((err,curUser)=>{
                        if (err) return res.json({
                            deleteFriend:false,
                            err
                        });
                        friend.save((err,friend)=>{
                            if (err) return res.json({
                                deleteFriend:false,
                                err
                            });
                            return res.json({
                                isAuth:true,
                                id:curUser._id,
                                nickname:curUser.nickname,
                                email:curUser.email,
                                image:curUser.image,
                                friends:curUser.friends,
                                inRequests:curUser.inRequests,
                                outRequests:curUser.outRequests
                            })
                        })
                    })
                }
            });
        }
    });
});

// GET ALL FRIENDS OF CURRENT USER AND CHECK FOR NEW MESSAGES FROM THEM//
app.get('/api/showFriends',(req,res)=>{

    //Find user friends
    User.find({friends:req.query.userId}).select({nickname:1,image:1}).exec((err,friends)=>{
        if (err) {
            return res.json({
                showFriends:false,
                err
            })
        }
        
        //Check if have unread messages from them
        Message.find({to:req.query.userId,read:false}).select({from:1,_id:0}).exec((err,messages)=>{
            if (err) return res.status(400).json({
                err
            });
            return res.status(200).json({
                friends,
                messages
            })
        });
    })
})

/*-------------------- GOOGLE REQUESTS -------------------- */

// GOOGLE SIGN-UP-IN //
app.post('/api/googleRegLog',(req,res)=>{
    
    //Make verification on google
    axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`)
    .then(({data})=>{
        if (data.email && data.email_verified) {
            
            //Find if user with that e-mail already exists
            User.findOne({'email':data.email},(err,user)=>{
                if (!user) {
                    const user = new User({
                        email: data.email,
                        nickname: data.given_name ? data.given_name : 'NoName',
                        password: data.jti + data.at_hash,
                        image: data.picture
                    });

                    //Register new user if not exists
                    user.save((err,user)=>{
                        if (err) return res.json({
                            success:false,
                            err
                        });

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
    });
})

if(process.env.NODE_ENV === 'production'){
    app.get('/*',(req,res)=>{
        res.sendfile(path.resolve(__dirname,'../client','build','index.html'))
    })
}

    
/*-------------------- LISTENING FOR REQUESTS -------------------- */
server.listen(config.PORT,()=>{
    console.log(`SERVER:${config.PORT}`)
})

