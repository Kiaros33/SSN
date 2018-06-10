import axios from 'axios';
import Constant from '../constants/actionTypes';

/*------------------------------------------ USER ACTIONS ------------------------------------------*/


// Login //
export function login({email,password}){

    const request = axios.post(`/api/login/`,{email,password})
    .then(response=>response.data);

    return {
        type: Constant.login,
        payload: request
    }
}


// Register with JWT //
export function register(user) {
    const request = axios.post(`/api/users/${user.email}`,{nickname:user.nickname,password:user.password})
    .then(response=>response.data);

    return {
        type: Constant.register,
        payload: request
    }
}


// Check is Auth //
export function isAuth(){

    const request = axios.get('/api/users/user')
    .then(response=>response.data);

    return {
        type: Constant.is_auth,
        payload: request
    }
}


// Edit user //
export function editUser(user){

    let fd = new FormData();
    fd.append('file',user.file,user.fileName);
    fd.append('nickname',user.nickname);
    fd.append('image',user.image);
    fd.append('oldImage',user.oldImage);
    fd.append('password',user.password);

    const request = axios.put(`/api/users/${user.id}`,fd)
    .then(response=>response.data);

    return {
        type: Constant.edit,
        payload: request
    }
}


// Search for friend by e-mail //
export function friendSearch(email){
    const request = axios.get(`/api/users/${email}`)
    .then(response=>response.data);
    return {
        type: Constant.search,
        payload: request
    }
}


// Invite friend //
export function friendInvite(userOut,userIn){
    const request = axios.post(`/api/users/${userOut}/friend-requests/${userIn}`)
    .then(response=>response.data);
    return {
        type: Constant.invite,
        payload: request
    }
}


// Get all requests //
export function getAllReq(userId){
    const request = axios.get(`/api/users/${userId}/friend-requests`)
    .then(response=>response.data);
    return {
        type: Constant.friend_requests,
        payload: request
    }
}

// Clear all requests //
export function clearAllReq(){
    return {
        type: Constant.requests_clear,
        payload: {
            inReq:[],
            outReq:[]
        }
    }
}


// Cancel outgoing request //
export function cancelOut(curUser,reqUser){
    const request = axios.delete(`/api/users/${curUser}/out-requests/${reqUser}`)
    .then(response=>response.data);
    return {
        type: Constant.cancel,
        payload: request
    }
}


// Reject incoming request //
export function cancelIn(curUser,reqUser){
    const request = axios.delete(`/api/users/${curUser}/in-requests/${reqUser}`)
    .then(response=>response.data);
    return {
        type: Constant.cancel,
        payload: request
    }
}


// Accept incoming request (become friends) //
export function acceptIn(curUser,reqUser){
    const request = axios.post(`/api/users/${curUser}/friends/${reqUser}`)
    .then(response=>response.data);
    return {
        type: Constant.accept,
        payload: request
    }
}


// Delete user from friends //
export function deleteFriend(curUser,friend){
    const request = axios.delete(`/api/users/${curUser}/friends/${friend}`)
    .then(response=>response.data);
    return {
        type: Constant.delete,
        payload: request
    }
}


// Get all friends of current user //
export function showFriends(userId){
    const request = axios.get(`/api/users/${userId}/friends`)
    .then(response=>response.data);
    return {
        type: Constant.friends,
        payload: request
    }
}

// Clear list of friends //
export function clearFriendList(){
    return {
        type: Constant.friends_clear,
        payload: {
            friends:[]
        }
    }
}


/*------------------------------------------ CHAT ACTIONS ------------------------------------------*/


// Load last 35 messages in room //
export function loadInitialData(id,user){
    return (dispatch) => {
        axios.get(`/api/chats/${id}?user=${user}`)
        .then(({data})=>{
            let response = {
                success:true,
                data
            }

            dispatch({
                type: Constant.load,
                payload: response
            })
        }) 
    }
}


// Add new message to the current room //
export const addItem = (message) => ({
    type: Constant.add,
    payload: message
})


// Clear messages list //
export const clearMessagesList = () => ({
    type: Constant.clear_messages,
    payload: {
        chat:{
            data:"-"
        }
    }
})


// Mark message as read //
export function readMessage(id){
    return (dispatch) => {
        axios.put(`/api/messages/${id}`)
        .then(({data})=>{
            let response = {
                data
            }
            dispatch({
                type: Constant.read,
                payload: response
            })
        })  
    }
}


/*------------------------------------------ GOOGLE ACTIONS ------------------------------------------*/


// Register and sign-in //
export function googleRegLog(token) {
    const request = axios.post(`/api/google`,{token})
    .then(response=>response.data);

    return {
        type: Constant.google,
        payload: request
    }
}