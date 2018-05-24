import { combineReducers } from 'redux';
import user from './usersReducer';
import chat from './chatReducer';

//Standard root reducer
const rootReducer = combineReducers({
    user,
    chat
});

export default rootReducer;
