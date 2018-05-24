import React, { Component } from 'react';
import { connect } from 'react-redux';
import {loadInitialData,addItem,readMessage} from '../../actions';
import io from 'socket.io-client';
import moment from 'moment-js';
import FontAwesome from 'react-fontawesome';

//Variables for multiple usage 
let socket
let room

class Private extends Component {

    constructor(props) {
        super(props);
        const {dispatch} = this.props;

        //Calculate room number
        let user1Id = this.props.user.login.id;
        let user2Id = this.props.location.pathname.split('/')[2];
        room = user1Id > user2Id ? user1Id + user2Id : user2Id + user1Id;

        //Connecting to socket
        socket = io(':3001');
        socket.on('connect',function(){

            console.log(`User connected to a socket`);

            //Join the room
            socket.emit('join',room,function(err){
                if (err) {
                    alert(err) 
                }
                else{
                    console.log(`New user connected to room ${room}`);
                    dispatch(loadInitialData(room,user1Id));
                }

                //On receiving message
                socket.on('messageBack',function(message){
                    dispatch(addItem(message));
                    if (user1Id === message.to) {
                        dispatch(readMessage(message));
                    }
                })

                //On receiving location
                socket.on('locationBack',function(message){
                    dispatch(addItem(message));
                    if (user1Id === message.to) {
                        dispatch(readMessage(message));
                    }
                })
            });
        });
    }
    
    state = {
        text:'',
        messages:'-'
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
    }
    
    //Send standard message, clear textarea
    submitForm = (event) => {
        event.preventDefault();
        socket.emit('message', {
            roomId:room,
            message:{
                text:this.state.text
            },
            to:this.props.location.pathname.split('/')[2],
            from:this.props.user.login.id,
            image:this.props.user.login.image

        }, function(back){

        });
        this.setState({
            text:''
        })

    }

    //Controllled textarea handler (should be uncontrolled??)
    handleInputText = (event) => {
        this.setState({
            text:event.target.value
        })
    }

    //Prevent line break on 'Enter' / Submit on 'Enter'
    onEnterPress = (event) => {
        if(event.keyCode === 13 && event.shiftKey === false) {
            event.preventDefault();
            event.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
        }
    }

    //Map messages for render then
    fetchData = (arr) => {
        if (arr === '-') {
            return(
                <div>Loading messages...</div>
            )
        }
        else if(arr.length === 0){
            return(
                <div>That chat is empty</div>
            )
        }
        else{
            return(
                arr.map((item,i) =>(
                    item.from === this.props.user.login.id ?
                    <div className="chat_user1" key={i}>
                        <div className="chat_user_info">
                            <div className="chat_date">{moment(item.createdAt).format('hh:mm')}</div>
                            <div className='chat_img' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}></div>
                            {
                                item.location? 
                                    <a className="chat_user_link" target="_blank" href={item.message.text}>I am on GoogleMaps <FontAwesome name='map'/></a>
                                :
                                    <div className="chat_user_text">{item.message.text}</div>
                            }
                            
                        </div>
                    </div>
                    :
                    <div className="chat_user2" key={i}>
                        <div className="chat_user_info">
                            <div className="chat_date">{moment(item.createdAt).format('hh:mm')}</div>
                            <div className='chat_img' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}></div>
                            {
                                item.location? 
                                    <a className="chat_user_link" target="_blank" href={item.message.text}>I am on GoogleMaps <FontAwesome name='map'/></a>
                                :
                                    <div className="chat_user_text">{item.message.text}</div>
                            }
                            
                        </div>
                    </div>
    
                ))
            )
        }
    }

    //Update messages on new message 
    componentWillReceiveProps(nextProps) {
        if(nextProps.chat.chat.data){
            this.setState({
                messages: nextProps.chat.chat.data
            })
        }
    }

    //Send location message
    sendLocHandler = () => {
        if (!navigator.geolocation) {
            return alert('Your browser does not support geolocation')
        }

        navigator.geolocation.getCurrentPosition((position)=>{
            socket.emit('createLocationMessage',{
                roomId:room,
                message:{
                    text:`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
                },
                to:this.props.location.pathname.split('/')[2],
                from:this.props.user.login.id,
                image:this.props.user.login.image,
                location:true
            });
        }, ()=>{
            alert('Unable to fetch location.')
        })
    }
    

    render() {
        return (
            <div className='chat_container'>
                {this.fetchData(this.state.messages)}
                
                <form onSubmit={this.submitForm}>
                    <textarea rows="2" placeholder="Enter a message" value={this.state.text} onChange={this.handleInputText} onKeyDown={this.onEnterPress}/>
                    <button type="submit">Send</button>
                </form>
                <button onClick={this.sendLocHandler}>My loc</button>
                <div ref={el => { this.el = el; }}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        chat: state.chat
    }
}

export default connect(mapStateToProps)(Private);
