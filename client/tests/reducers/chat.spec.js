import reducer from '../../src/reducers/chatReducer';

describe('user reducer',() => {

    it('should user the right case', ()=>{
        const action = {
            type:'ADD_MSG',
            payload:{
                roomId:'room_id',
                message:{
                    text:'Hello, test'
                },
                to:'friend_id',
                from:'user_id',
                image:'image'
            }
        }

        expect(reducer({
            chat:{
                data:[]
            }
        },action)).toEqual({
            chat: {
                data: [{
                    from: "user_id", 
                    image: "image", 
                    message: {"text": "Hello, test"}, 
                    roomId: "room_id", 
                    to: "friend_id"
                }]
            }
        })
    })
})