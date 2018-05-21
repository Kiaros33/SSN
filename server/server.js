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


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/public')));

/*SOCKET LOGIC HERE*/

//On new connection
io.on('connection',(socket)=>{
    console.log('User connected to a socket')

    //On join a particular room
    socket.on('join',(room,cb)=>{
        socket.join(room);
        
        socket.on('message',(message,cb)=>{
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
        cb();
    });


    socket.on('disconnect',()=>{
        console.log('User disconnected')
    })
    
})





/* ===================== CHAT SHIT ===================== */
// LOAD INITIAL DATA OF THE CHAT ROOM//
app.get('/api/loadInitialData',(req,res)=>{
    let room = req.query.room;

    Message.find({roomId: room}).sort({createdAt:'desc'}).limit(35).exec((err,msglist)=>{
        if (err) return res.status(400).send(err);

        msglist.reverse();

        res.send(msglist);
    })    
})



/* =================== USER REQUESTS =================== */

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
    User.findById(req.body.id,(err,user)=>{
        if (err) return res.status(400).json({
            err
        });
        user.nickname = req.body.nickname ? req.body.nickname : user.nickname;
        user.password = req.body.password ? req.body.password : user.password;
        user.image = req.body.image ? req.body.image : user.image;
        
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

        user.comparePasswords(req.body.password,(err,isMatch)=>{
            if (!isMatch) return res.json({
                isAuth:false,
                message:'Wrong password'
            });

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
app.post('/api/upload',(req,res)=>{
    const form = new formidable.IncomingForm();
    form.maxFileSize = 3 * 1024 * 1024;
    form.uploadDir = path.join(__dirname,'../client/public/uploads');

    form.parse(req, (err, field, file)=>{
        if (err) return res.json({
            success:false,
            err
        })
    });

    form.on('file', (field,file)=>{
        if(file.type.split("/")[0] !== 'image'){
            fs.rename(file.path,'new_path',(err)=>{
                if (err) return res.json({
                    success:false,
                    err
                })
            });
        }
        else{
            fs.rename(file.path,path.join(form.uploadDir,file.name),(err)=>{
                if (err) return res.json({
                    success:false,
                    err
                })
            });
        }
        
    });

    form.on('end', ()=>{
        res.json({
            success:true
        });
    });

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

    User.findById(userOutId,(err,userOut)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            User.findById(userInId,(err,userIn)=>{
                if (err) return res.status(400).json({
                    err
                });

                else if (userOut._id.toString()===userIn._id.toString()) {
                    return res.json({
                        outReqSuccess:false,
                        outReqMessage:"This person is you"
                    })
                }

                else if (userOut.outRequests.includes(userInId) || userOut.friends.includes(userInId) || userOut.inRequests.includes(userInId)) {
                    return res.json({
                        outReqSuccess:false,
                        outReqMessage:"This person is already your friend or requested to be your friend"
                    })
                }

                else{
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

    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });

                else{
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

    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });

        else{
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });

                else{
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

    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });
        

        else{
            User.findById(reqUserId,(err,reqUser)=>{
                if (err) return res.status(400).json({
                    err
                });
                
                else{
                    
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

    User.findById(curUserId,(err,curUser)=>{
        if (err) return res.status(400).json({
            err
        });
        

        else{
            User.findById(friendId,(err,friend)=>{
                if (err) return res.status(400).json({
                    err
                });
                
                else{
                    
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

// GET ALL FRIENDS OF CURRENT USER //
app.get('/api/showFriends',(req,res)=>{
    User.find({friends:req.query.userId}).select({nickname:1,image:1}).exec((err,friends)=>{
        if (err) {
            return res.json({
                showFriends:false,
                err
            })
        }
        return res.status(200).json({
            friends
        })
    })
})
    
/*====================LISTEN====================*/
server.listen(config.PORT,()=>{
    console.log(`SERVER:${config.PORT}`)
})