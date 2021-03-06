import React, { Component } from 'react';
import moment from 'moment';
import FontAwesome from 'react-fontawesome';

class Chat extends Component {
    
    state = {
        text:'',
        messages:'-'
    }

    //Send standard message, clear textarea
    submitForm = (event) => {
        event.preventDefault();
        this.props.socket.emit('message', {
            roomId:this.props.room,
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
                <div>This chat is empty</div>
            )
        }
        else{
            return(
                arr.map((item,i) =>(
                    item.from === this.props.user.login.id ?
                    <div className="chat_user1" key={i}>
                        <div className="chat_user_info">
                            <div className="chat_date">{moment(item.createdAt).format('HH:mm')}</div>
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
                            <div className="chat_date">{moment(item.createdAt).format('HH:mm')}</div>
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
        this.setState({
            messages: nextProps.chat.chat.data
        })
    }

    //Send location message
    sendLocHandler = () => {
        if (!navigator.geolocation) {
            return alert('Your browser does not support geolocation')
        }

        navigator.geolocation.getCurrentPosition((position)=>{
            this.props.socket.emit('createLocationMessage',{
                roomId:this.props.room,
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
                <button onClick={this.sendLocHandler}>Loc</button>
            </div>
        );
    }
}

export default Chat
