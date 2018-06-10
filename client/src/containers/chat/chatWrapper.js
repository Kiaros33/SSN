import React, { Component } from 'react';
import { connect } from 'react-redux';
import {loadInitialData,addItem,readMessage,clearMessagesList} from '../../actions';
import Chat from '../../components/chat/chat';
import io from 'socket.io-client';
const config = require('../../config').get(process.env.NODE_ENV);
let socket;
let room;

class ChatWrapper extends Component {

    //Connect to a socket and room on  mount
    componentWillMount() {
        socket = io(config.SOCKET);

        let user1Id = this.props.user.login.id;
        let user2Id = this.props.location.pathname.split('/')[2];
        room = user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;
        require('../../components/chat/socket')(socket,user1Id,user2Id,room,this.props.loadData,this.props.add,this.props.read);
    }

    //Scroll to the last element
    scrollToBottom = () => {
        this.el.scrollIntoView({behavior:'smooth'})
    }

    //Scroll on update
    componentDidUpdate() {
        this.scrollToBottom();
    }

    //Disconnect on unmount
    componentWillUnmount() {
        socket.disconnect();      
        this.props.clear();
    }
    
    //Render Private chat component with a socket and room
    render() {
        return (
            <div>
                <Chat {...this.props} socket={socket} room={room}/>
                <div ref={el => { this.el = el; }}/>
            </div>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        user: state.user,
        chat: state.chat
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadData: (room,user1Id) => {
            dispatch(loadInitialData(room,user1Id));
        },
        add: (message) => {
            dispatch(addItem(message));
        },
        read: (message) => {
            dispatch(readMessage(message._id));
        },
        clear: () => {
            dispatch(clearMessagesList());
        }
    }
}


export default connect(mapStateToProps,mapDispatchToProps)(ChatWrapper);

