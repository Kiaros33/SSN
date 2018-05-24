export default function (state={},action) {
    //Chat reducers
    switch (action.type) {
        case 'READ_MSG':
            return {...state,readLast:action.payload};
        
        case 'LOAD_MSGS':
            return {...state,chat:action.payload};
        
        case 'ADD_ITEM':
        //Add new message to current array of messages
            let arr = state.chat.data;
            arr.push(action.payload)
            return {...state};
        
        default:
            return state;
    }
}