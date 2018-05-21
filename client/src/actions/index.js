import axios from 'axios';

/*============= USER ==============*/

export function login({email,password}){

    const request = axios.post('/api/login',{email,password})
    .then(response=>response.data);

    return {
        type:'USER_LOGIN',
        payload:request
    }
}

export function register(user) {
    const request = axios.post(`/api/register`,user)
    .then(response=>response.data);

    return {
        type:'USER_REGISTER',
        payload:request
    }
    
}

export function isAuth(){

    const request = axios.get('/api/isAuth')
    .then(response=>response.data);

    return {
        type:'USER_AUTH',
        payload:request
    }
}

export function editUser(user){
    let file = user.file;
    let fileName = user.fileName;
    const request = axios.post(`/api/editUser`,user)

    return (dispatch)=>{
        request.then(({data})=>{
            let user = data;
            const fd = new FormData();
            fd.append('image',file,fileName);

            axios.post(`/api/upload`,fd)
            .then(({data})=>{
                let response = {
                    success:true,
                    isAuth:true,
                    id:user.id,
                    nickname:user.nickname,
                    email:user.email,
                    image:user.image
                }

                dispatch({
                    type:'USER_EDIT',
                    payload:response
                })
            })
        })
    }
}

export function friendSearch(email){
    const request = axios.get(`/api/friendSearch?email=${email}`)
    .then(response=>response.data);
    return {
        type:'FRIEND_SEARCH',
        payload:request
    }
}

export function friendInvite(userOut,userIn){
    const request = axios.post(`/api/friendInvite`,{userOut,userIn})
    .then(response=>response.data);
    return {
        type:'FRIEND_INVITE',
        payload:request
    }
}

export function getAllOut(userId){
    const request = axios.get(`/api/getAllOut?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_OUT',
        payload:request
    }
}

export function getAllIn(userId){
    const request = axios.get(`/api/getAllIn?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_IN',
        payload:request
    }
}

export function cancelOut(curUser,reqUser){
    const request = axios.post(`/api/cancelOut`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'CANCEL_OUT_REQ',
        payload:request
    }
}

export function cancelIn(curUser,reqUser){
    const request = axios.post(`/api/cancelIn`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'CANCEL_IN_REQ',
        payload:request
    }
}

export function acceptIn(curUser,reqUser){
    const request = axios.post(`/api/acceptIn`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'ACCEPT_IN_REQ',
        payload:request
    }
}

export function deleteFriend(curUser,friend){
    const request = axios.post(`/api/deleteFriend`,{curUser,friend})
    .then(response=>response.data);
    return {
        type:'DELETE_FRIEND',
        payload:request
    }
}


export function showFriends(userId){
    const request = axios.get(`/api/showFriends?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_FRIENDS',
        payload:request
    }
}

export function clearReg(){
    return{
        type:'CLEAR_REG',
        payload:{
            success:false,
            user:null
        }
    }
}



// CHAT SHIT!!!!!!!!!!!!!!!!!!!!!

// export function enterChat(user1Id,user2Id){
//     const room = user1Id>user2Id ? user1Id + user2Id : user2Id + user1Id;

//     const socket = openSocket('http://192.168.1.39:3001');

//     socket.on('connect',function(){

//         console.log(`User connected to a socket`);

//         socket.emit('join',room,function(err){
//             if (err) {
//                alert(err) 
//             }
//             else{
//                 console.log(`New user connected to room ${room}`)
//             }
//         })
//     });

//     const request = axios.get(`/api/enterChat?room=${room}`)
//     .then(response=>response.data);

//     return{
//         type:'ENTER_CHAT',
//         payload:request
//     }
// }


export function loadInitialData(room){
    return (dispatch) => {
        axios.get(`/api/loadInitialData?room=${room}`)
        .then(({data})=>{
            let response = {
                success:true,
                data
            }

            dispatch({
                type:'LOAD_MSGS',
                payload:response
            })
        })
        
    }
}

export const addItem = (data) => ({
    type: "ADD_ITEM",
    payload: data
})
