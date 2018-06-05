const request = require('supertest');
const expect = require('expect');
const {app} = require('../server');
const {User} = require('../models/user');

let user_id
let friend_id
let auth

before((done) => {
    const friend = new User({
        email:'friend@mail.ru',
        password:'Password123',
        nickname:'Friend'
    })

    friend.save()
    .then(friend => {
        friend_id = friend._id
        done();
    })
})

after((done) => {
    User.remove({email:'user@mail.ru'})
    .then(() => {
        User.remove({email:'friend@mail.ru'})
        .then(() => done())
    })
});


// ********** REGISTER TEST ********** //
describe('POST/register', () => {
    it('should create a new user', (done) => {
        request(app)
        .post('/api/users/user@mail.ru')
        .send({
            password:'Password123',
            nickname:'testUser'
        })
        .expect(200)
        .expect((res) => {
            expect(res.body).toMatchObject({
                success:true,
                user:{
                    image:'https://s3.amazonaws.com/ssn-data-images/default-user-image.png',
                    friends:[],
                    inRequests:[],
                    outRequests:[],
                    email:'user@mail.ru',
                    nickname:'testUser'
                }
            })
        })
        .end((err,res) => {
            if (err) {
                return done(err)
            }

            User.findOne({email:res.body.user.email})
            .then(person => {
                user_id=person._id
                expect(person.nickname).toBe('testUser');
                done();
            })
            .catch(err => done(err))
        })
    })

    it('should not create a new user with invalid data', (done) => {
        request(app)
        .post('/api/users/usermail.ru')
        .send({
            password:'Password',
            nickname:'testUser'
        })
        .expect(400)
        .expect((res) => {
            expect(res.body.type).toBe('Validation_Error')
        })
        .end((err,res) => {
            if (err) {
                return done(err)
            }

            User.findOne({email:'usermail.ru'})
            .then(person => {
                expect(person).toBeNull();
                done();
            })
            .catch((err)=>done(err));
        })
    })
})


// ********** LOGIN TEST ********** //
describe('POST/login', () => {
    it('should not login user', (done) => {
        request(app)
        .post('/api/login/')
        .send({
            email:'user@mail.ru',
            password: 'Password12'
        })
        .expect((res) => {
            expect(res.body).toMatchObject({
                isAuth:false,
                message:'Wrong password'
            })
            expect(res.header['set-cookie']).toBeUndefined()
        })
        .end((err,res) => {
            if (err) return done(err);
            done();
        })
    })

    it('should login user and add token', (done) => {
        request(app)
        .post('/api/login/')
        .send({
            email:'user@mail.ru',
            password: 'Password123'
        })
        .expect(200)
        .expect((res) => {
            expect(res.body).toMatchObject({
                isAuth:true,
                nickname:'testUser',
                email:'user@mail.ru',
                image:'https://s3.amazonaws.com/ssn-data-images/default-user-image.png'
            })
            auth = res.header['set-cookie'][0].split(';',1)[0];
            expect(res.header['set-cookie'][0].split(';',1)[0]).toMatch(/auth=.+/)
        })
        .end((err,res) => {
            if (err) return done(err);
            done();
        })
    })
})


// ********** EDIT TEST ********** //
describe('PUT/edit profile',() => {
    const filePath = `${__dirname}/testFiles/1.jpg`
    it('should edit user data', (done) => {
        request(app)
        .put(`/api/users/${user_id}`)
        .set('Cookie', auth)
        .field('nickname','newName')
        .field('image',`https://s3.amazonaws.com/ssn-data-images/uploads/test.jpg`)
        .field('oldImage','https://s3.amazonaws.com/ssn-data-images/default-user-image.png')
        .field('password','newPassword123')
        .attach('file', filePath, `test.jpg`)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                addSuccess:true,
                deleteSuccess:true,
                success:true,
                isAuth:true,
                nickname:'newName',
                email:'user@mail.ru',
                image:'https://s3.amazonaws.com/ssn-data-images/uploads/test.jpg'
            })
            done();
        })
    })

    it('should not edit another user data', (done) => {
        request(app)
        .put(`/api/users/${friend_id}`)
        .set('Cookie', auth)
        .field('nickname','newName')
        .field('image',`https://s3.amazonaws.com/ssn-data-images/uploads/test.jpg`)
        .field('oldImage','https://s3.amazonaws.com/ssn-data-images/default-user-image.png')
        .field('password','newPassword123')
        .attach('file', filePath, `test.jpg`)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                message: "You are not allowed to do that", 
                type: "Forbidden_Error"
            })
            done();
        })
    })
})


// ********** SEND FRIEND REQUEST TEST ********** //
describe('POST/friend invite', () => {
    it ('should send request to be friends', (done) => {
        request(app)
        .post(`/api/users/${user_id}/friend-requests/${friend_id}`)
        .set('Cookie', auth)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                outReqSuccess:true
            })
            done();
        })
    })

    it ('should not send request to himself', (done) => {
        request(app)
        .post(`/api/users/${user_id}/friend-requests/${user_id}`)
        .set('Cookie', auth)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                outReqSuccess:false,
                message:"This person is you"
            })
            done();
        })
    })

    it ('should not send request to someone already requested', (done) => {
        request(app)
        .post(`/api/users/${user_id}/friend-requests/${friend_id}`)
        .set('Cookie', auth)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                outReqSuccess:false,
                message:"This person is already your friend or requested to be your friend"
            })
            done();
        })
    })
})


// ********** GET REQUESTS TEST ********** //
describe('GET/requests', () => {
    it('should return arrays of inRequests and outRequests', (done) => {
        request(app)
        .get(`/api/users/${user_id}/friend-requests`)
        .end((err,res) => {
            expect(Array.isArray(res.body.outReq)).toBe(true);
            expect(res.body.outReq.length).toBe(1);
            expect(res.body.inReq.length).toBe(0);
            done();
        })
    })
})


// ********** DELETE OUTGOING REQUEST TEST ********** //
describe('DELTE/outgoing Request', () => {
    it('should delete outgoing request',(done) => {
        request(app)
        .delete(`/api/users/${user_id}/out-requests/${friend_id}`)
        .set('Cookie', auth)
        .end((err,res) => {
            expect(res.body).toMatchObject({
                isAuth:true,
                id:`${user_id}`,
                nickname:'newName',
                email:'user@mail.ru',
                image:'https://s3.amazonaws.com/ssn-data-images/uploads/test.jpg',
                friends:[],
                inRequests:[],
                outRequests:[]
            })
            done();
        })
    })
})





