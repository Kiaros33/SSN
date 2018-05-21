import { combineReducers } from 'redux';
import user from './usersReducer';
import chat from './chatReducer';

const rootReducer = combineReducers({
    user,
    chat
});

export default rootReducer;
