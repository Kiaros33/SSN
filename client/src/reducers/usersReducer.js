import Constant from '../constants/actionTypes';

export default function (state={
    register:{
        response:{
            data:{
                type:'',
                code:'',
                message:''
            }
        }
    },
    friends:{
        friends:[]
    },
    friendship:{
        searchSuccess:false,
        user:''
    },
    requests:{
        outReq:[],
        inReq:[]
    }
},action) {
    //User reducers
    switch (action.type) {
        case Constant.login:
            return {...state,login:action.payload};

        case Constant.google:
            return {...state,login:action.payload};

        case Constant.is_auth:
            return {...state,login:action.payload};
        
        case Constant.search:
            return {...state,friendship:action.payload};

        case Constant.invite:
            return {...state,friendship:action.payload};

        case Constant.edit:
            return {...state,login:action.payload};

        case Constant.register:
            return {...state,register:action.payload}

        case Constant.friend_requests:
            return {...state,requests:action.payload}

        case Constant.requests_clear:
            return {...state,requests:action.payload}

        case Constant.friends:
            return {...state,friends:action.payload}

        case Constant.friends_clear:
            return {...state,friends:action.payload}

        case Constant.delete:
            return {...state,login:action.payload}

        case Constant.cancel:
            return {...state,login:action.payload}

        case Constant.accept:
            return {...state,login:action.payload}
    
        default:
            return state;
    }
}