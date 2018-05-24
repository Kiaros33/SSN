const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get(process.env.NODE_ENV);
const SALT_I = 10;

//User model with validation
const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1,
        validate:{
            validator: function(email){
                return email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        validate:{
            validator: function(password) {
                return password.length >= 6 // Length
                    && !~password.indexOf(" ") // No spaces
                    && password.match(/[A-Z]/) != null // One uppercase
                    && password.match(/[a-z]/) != null // One lowercase
                    && password.match(/[0-9]/) != null; // One numerical digit
            }
        }
    },
    nickname:{
        type:String,
        required:true,
        maxlength:70
    },
    image:{
        type:String,
        default:'https://s3.amazonaws.com/ssn-data-images/default-user-image.png'
    },
    friends:{
        type:Array,
        default:[]
    },
    inRequests:{
        type:Array,
        default:[]
    },
    outRequests:{
        type:Array,
        default:[]
    },
    role:{
        type:Number,
        default:0
    },
    token:{
        type:String
    }

},{timestamps:true})

//genSalt and hash password before save
userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_I,function(err,salt){
            if (err) return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    }
    else{
        next()
    }
});

//Compare usual password with existing hashed password
userSchema.methods.comparePasswords = function(candidate,cb){
    bcrypt.compare(candidate,this.password,function(err,isMatch){
        if (err) return cb(err);
        cb(null,isMatch);
    })
};

//Genereate JWToken
userSchema.methods.genToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),config.SECRET);

    user.token = token;
    user.save(function(err,user){
        if (err) return cb(err);
        cb(null,user)
    })
};

//Find user by token 
userSchema.statics.findByToken = function(token,cb) {
    var user = this;
    jwt.verify(token,config.SECRET,function (err,decoded) {
        user.findOne({"_id":decoded,"token":token},function(err,user) {
            if(err) return cb(err);
            cb(null,user);
        })
    })
};

//Delete token
userSchema.methods.delToken = function(token,cb) {
    var user = this;
    user.update({$unset:{token:1}},(err,user)=>{
        if(err) return cb(err);
        cb(null,user);
    })
};

const User = mongoose.model('User',userSchema);

module.exports = {User}