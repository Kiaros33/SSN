import axios from 'axios';


/*------------------------------------------ USER ACTIONS ------------------------------------------*/


// Login //
export function login({email,password}){

    const request = axios.post('/api/login',{email,password})
    .then(response=>response.data);

    return {
        type:'USER_LOGIN',
        payload:request
    }
}


// Register with JWT //
export function register(user) {
    const request = axios.post(`/api/register`,user)
    .then(response=>response.data);

    return {
        type:'USER_REGISTER',
        payload:request
    }
}


// Check is Auth //
export function isAuth(){

    const request = axios.get('/api/isAuth')
    .then(response=>response.data);

    return {
        type:'USER_AUTH',
        payload:request
    }
}


// Edit user //
export function editUser(user){
    let file = user.file;
    let fileName = user.fileName;
    const request = axios.post(`/api/editUser`,user)

    return (dispatch)=>{
        request.then(({data})=>{
            let user = data;
            const fd = new FormData();
            fd.append('image',file,fileName);
            let config = {
                headers: {'Content-Type':'multipart/form-data'}
            }
            axios.post(`/api/upload`,fd,config)
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


// Search for friend by e-mail //
export function friendSearch(email){
    const request = axios.get(`/api/friendSearch?email=${email}`)
    .then(response=>response.data);
    return {
        type:'FRIEND_SEARCH',
        payload:request
    }
}


// Invite friend //
export function friendInvite(userOut,userIn){
    const request = axios.post(`/api/friendInvite`,{userOut,userIn})
    .then(response=>response.data);
    return {
        type:'FRIEND_INVITE',
        payload:request
    }
}


// Get all outgoing requests //
export function getAllOut(userId){
    const request = axios.get(`/api/getAllOut?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_OUT',
        payload:request
    }
}


// Get all incoming requests //
export function getAllIn(userId){
    const request = axios.get(`/api/getAllIn?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_IN',
        payload:request
    }
}


// Cancel outgoing request //
export function cancelOut(curUser,reqUser){
    const request = axios.post(`/api/cancelOut`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'CANCEL_OUT_REQ',
        payload:request
    }
}


// Reject incoming request //
export function cancelIn(curUser,reqUser){
    const request = axios.post(`/api/cancelIn`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'CANCEL_IN_REQ',
        payload:request
    }
}


// Accept incoming request (become friends) //
export function acceptIn(curUser,reqUser){
    const request = axios.post(`/api/acceptIn`,{curUser,reqUser})
    .then(response=>response.data);
    return {
        type:'ACCEPT_IN_REQ',
        payload:request
    }
}


// Delete user from friends //
export function deleteFriend(curUser,friend){
    const request = axios.post(`/api/deleteFriend`,{curUser,friend})
    .then(response=>response.data);
    return {
        type:'DELETE_FRIEND',
        payload:request
    }
}


// Get all friends of current user //
export function showFriends(userId){
    const request = axios.get(`/api/showFriends?userId=${userId}`)
    .then(response=>response.data);
    return {
        type:'GET_ALL_FRIENDS',
        payload:request
    }
}


// Clear registration form //
export function clearReg(){
    return{
        type:'CLEAR_REG',
        payload:{
            success:false,
            user:null
        }
    }
}


/*------------------------------------------ CHAT ACTIONS ------------------------------------------*/


// Load last 35 messages in room //
export function loadInitialData(room,user){
    return (dispatch) => {
        axios.get(`/api/loadInitialData?room=${room}&user=${user}`)
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


// Add new message to the current room //
export const addItem = (message) => ({
    type: "ADD_ITEM",
    payload: message
})


// Mark message as read //
export function readMessage(message){
    return (dispatch) => {
        axios.post(`/api/readMessage`,{message})
        .then(({data})=>{
            let response = {
                data
            }
            dispatch({
                type:'READ_MSG',
                payload:response
            })
        })  
    }
}


/*------------------------------------------ GOOGLE ACTIONS ------------------------------------------*/


// Register and sign-in //
export function googleRegLog(token) {
    const request = axios.post(`/api/googleRegLog`,{token})
    .then(response=>response.data);

    return {
        type:'GOOGLE_REG_LOG',
        payload:request
    }
}