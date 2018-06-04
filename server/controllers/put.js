const {User} = require('../models/user');
const {Message} = require('../models/chat');
const {auth} = require('../middleware/auth');
const config = require('../config/config').get(process.env.NODE_ENV);
const fs = require('fs');
const AWS = require('aws-sdk');

//Specify region for storage
AWS.config.region = 'us-east-1'

//Multer for make data readable
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' })

module.exports = function(app){


    // MAKE MESSAGE READ //
    app.put('/api/messages/:id',(req,res,next)=>{
        Message.findByIdAndUpdate(req.params.id,{read:true}).exec()
        .then(message => {
            return res.json({
                read:true
            })
        })
        .catch(err => {
            next(err)
        })
    })


    // USER EDIT //
    app.put('/api/users/:id',auth, upload.single('file'),(req,res,next)=>{
        
        let file = req.file;
        let id = req.params.id;
        
        if(req.user._id.toString() !== id.toString()){
            let err = new Error();
            err.message = 'You are not allowed to do that';
            err.name = 'Forbidden_Error';
            err.status = 403;
            return next(err);
        }

        function uploadFile(cb){
            if (file && file.size<3145728) {
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
                        addSuccess:false,
                        err
                    }) 
                    else {
                        cb();
                        try {
                            fs.unlinkSync(file.path);
                        }
                         
                        catch (err) {
                            console.log(err)
                        }
                        if (file.originalname !== req.body.oldImage.split('/')[5]) {
                            let paramsToDel = {
                                Bucket:config.BUCKET_NAME,
                                Key: 'uploads/' + req.body.oldImage.split('/')[5]
                            }
                            s3.deleteObject(paramsToDel, function(err,data) {
                                if (err) return res.json({
                                    addSuccess:true,
                                    deleteSuccess:false,
                                    err
                                })
                            })
                        }
                    }
                })
            }
            else{
                cb();
            }
        }
        
        function editUser(){
            //Find user by id
            User.findById(id).exec()
            .then(user => {
                
                //Set changes
                user.nickname = req.body.nickname ? req.body.nickname : user.nickname;
                user.password = req.body.password ? req.body.password : user.password;

                if(req.body.image){
                    user.image = req.body.image
                    //Change image of existing messages
                    Message.update({from:id},{image:user.image},{multi: true}).exec()
                    .catch(err => {
                        next(err)
                    })
                }
                
                //Apply changes
                user.save()
                .then(user => {
                    return res.status(200).json({
                        addSuccess:true,
                        deleteSuccess:true,
                        success:true,
                        isAuth:true,
                        id:user._id,
                        nickname:user.nickname,
                        email:user.email,
                        image:user.image
                    })
                })
                .catch(err => {
                    next(err)
                })
            })
            .catch(err => {
                next(err)
            })
        }
        uploadFile(editUser);
    });
}
