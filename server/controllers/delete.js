const {User} = require('../models/user');
const {auth} = require('../middleware/auth');

module.exports = function(app){


    // DELETE OUTGOING REQUEST //
    app.delete('/api/users/:id/out-requests/:request_id',auth,(req,res,next)=>{
        let curUserId = req.params.id;
        let reqUserId = req.params.request_id;

        //Find user who wants to cancel request
        User.findById(curUserId).exec()
        .then(curUser => {

            //Find user who have the request as incoming
            User.findById(reqUserId).exec()
            .then(reqUser => {

                //Remove requests from both users
                reqUser.inRequests.pull(curUserId);
                curUser.outRequests.pull(reqUserId);

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


    // DELETE INCOMING REQUEST //
    app.delete('/api/users/:id/in-requests/:request_id',auth,(req,res,next)=>{
        let curUserId = req.params.id;
        let reqUserId = req.params.request_id;

        //Find user who wants to cancel request
        User.findById(curUserId).exec()
        .then(curUser => {

            //Find user who have the request as incoming
            User.findById(reqUserId).exec()
            .then(reqUser => {

                //Remove requests from both users
                curUser.inRequests.pull(reqUserId);
                reqUser.outRequests.pull(curUserId);

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


    // DELETE FROM FRIENDS //
    app.delete('/api/users/:id/friends/:friend_id',auth,(req,res,next)=>{
        let curUserId = req.params.id;
        let friendId = req.params.friend_id;

        //Find user who wants to delete
        User.findById(curUserId)
        .then(curUser => {

            //Find friend
            User.findById(friendId)
            .then(friend => {

                //Remove from friends from both users
                curUser.friends.pull(friendId);
                friend.friends.pull(curUserId);
                
                Promise.all([curUser.save(), friend.save()])
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
}