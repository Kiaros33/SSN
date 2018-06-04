import Constant from '../constants/actionTypes';

export default function (state={
    chat:{
        data:'-'
    }
},action) {
    //Chat reducers
    switch (action.type) {
        case Constant.read:
            return {...state,readLast:action.payload};
        
        case Constant.load:
            return {...state,chat:action.payload};
        
        case Constant.add:
        //Add new message to current array of messages
            let arr = state.chat.data;
            if (!arr.includes(action.payload)){
                arr.push(action.payload)
            }
            return {...state};
        
        default:
            return state;
    }
}