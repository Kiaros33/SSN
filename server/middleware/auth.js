const {User} = require('../models/user');

//Take token and try to find user, next if ok
let auth = (req,res,next)=>{
    let token = req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({
            error:true,
            message:'You are not logged in'
        });

        req.token = token;
        req.user = user;
        next();
    })
};

module.exports = {auth}