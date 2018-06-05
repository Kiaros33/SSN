const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config').get(process.env.NODE_ENV);
const fs = require('fs');
const { MongoError } = require('mongodb');

//Express on
const app = express();

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

//Connect controllers
require('./controllers/get')(app);
require('./controllers/post')(app);
require('./controllers/put')(app);
require('./controllers/delete')(app);
require('./controllers/socket')(io);

//Catch DB errors
app.use(function handleDatabaseError(err, req, res, next) {
    if (err instanceof MongoError) {
        return res.status(503).json({
            type: 'Mongo_Error',
            code: err.code,
            message: err.message
        });
    }
    next(err);
});

//Catch validation errors
app.use(function handleValidationError(err, req, res, next) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            type: 'Validation_Error',
            message: err.message
        });
    }
    next(err);
});

//Catch internal errors
app.use(function handleInternalError(err, req, res, next) {
    return res.status(err.status || 500).json({
        type: err.name,
        message: err.message
    });
    next(err);
});

//Make build on production
if(process.env.NODE_ENV === 'production'){
    app.get('/*',(req,res)=>{
        res.sendfile(path.resolve(__dirname,'../client','build','index.html'))
    })
}

//Catch 404 error
app.use(function(req, res, next) {
    return res.status(404).json({
        type: '404_Error',
        message: 'Page does not exist at the moment'
    });
});

/*-------------------- LISTENING FOR REQUESTS -------------------- */
server.listen(config.PORT,()=>{
    console.log(`SERVER:${config.PORT}`)
})


 module.exports.app = app;