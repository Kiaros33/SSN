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


/*============= CHAT ==============*/

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

export const addItem = (message) => ({
    type: "ADD_ITEM",
    payload: message
})

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


/*============= GOOGLE ==============*/

export function googleRegLog(token) {
    const request = axios.post(`/api/googleRegLog`,{token})
    .then(response=>response.data);

    return {
        type:'GOOGLE_REG_LOG',
        payload:request
    }
    
}