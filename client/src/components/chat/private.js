import React, { Component } from 'react';
import { connect } from 'react-redux';
import {loadInitialData,addItem,readMessage} from '../../actions';
import io from 'socket.io-client';
import moment from 'moment-js'


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
        socket = io('http://192.168.1.39:3001');
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
            });
        });
    }
    


    state = {
        text:'',
        messages:'-'
    }

    scrollToBottom=()=>{
        this.el.scrollIntoView({behavior:'smooth'})
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }


    componentWillUnmount() {
        socket.disconnect();
    }
    
    
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

    handleInputText = (event) => {
        this.setState({
            text:event.target.value
        })
    }

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
                        <div className="chat_user1_info">
                            <div className="chat_date">{moment(item.createdAt).format('hh:mm')}</div>
                            <div className='chat_img' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}></div>
                            <div className="chat_user1_text">{item.message.text}</div>
                        </div>
                    </div>
                    :
                    <div className="chat_user2" key={i}>
                        <div className="chat_user2_info">
                            <div className="chat_user2_text">{item.message.text}</div>
                            <div className='chat_img' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}></div>
                            <div className="chat_date">{moment(item.createdAt).format('hh:mm')}</div>
                        </div>
                    </div>
    
                ))
            )
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.chat.chat.data){
            this.setState({
                messages: nextProps.chat.chat.data
            })
        }
    }
    

    render() {
        return (
            <div className='chat_container'>
                {this.fetchData(this.state.messages)}
                
                <form onSubmit={this.submitForm}>
                    <input type="text" placeholder="Enter a message" value={this.state.text} onChange={this.handleInputText}/>
                    <button type="submit">Send</button>
                </form>
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
