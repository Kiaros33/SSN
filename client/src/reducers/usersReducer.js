export default function (state={},action) {
    //User reducers
    switch (action.type) {
        case 'USER_LOGIN':
            return {...state,login:action.payload};

        case 'GOOGLE_REG_LOG':
            return {...state,login:action.payload};

        case 'USER_AUTH':
            return {...state,login:action.payload};
        
        case 'FRIEND_SEARCH':
            return {...state,friendship:action.payload};

        case 'FRIEND_INVITE':
            return {...state,friendship:action.payload};

        case 'USER_EDIT':
            return {...state,login:action.payload};

        case 'UPLOAD':
            return {...state,file:action.payload};

        case 'USER_REGISTER':
            return {...state,register:action.payload}

        case 'CLEAR_REG':
            return {...state,register:action.payload}

        case 'GET_ALL_OUT':
            return {...state,outRequests:action.payload}

        case 'GET_ALL_IN':
            return {...state,inRequests:action.payload}

        case 'GET_ALL_FRIENDS':
            return {...state,friends:action.payload}

        case 'DELETE_FRIEND':
            return {...state,login:action.payload}

        case 'CANCEL_OUT_REQ':
            return {...state,login:action.payload}

        case 'CANCEL_IN_REQ':
            return {...state,login:action.payload}

        case 'ACCEPT_IN_REQ':
            return {...state,login:action.payload}
    
        default:
            return state;
    }
}