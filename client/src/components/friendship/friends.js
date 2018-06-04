import React, { Component } from 'react';
import { connect } from 'react-redux';
import {showFriends,deleteFriend,clearFriendList} from '../../actions';
import {Link} from 'react-router-dom';
import Popup from 'reactjs-popup';

class Friends extends Component {

    //Get all friends of current user
    componentWillMount() {
        this.props.show(this.props.user.login.id);
    }

    //Clear list of friends
    componentWillUnmount() {
        this.props.clear();
    }

    //Count unread messages
    countMessages = (val,arr) =>{
        let overall = 0;
        for (let i = 0; i < arr.length; i++) {
            if (val===arr[i].from) {
                overall+=1
            }
        }
        if (overall===0) {
            return null
        }
        return `(${overall})`
    }

    //Map friends for render then
    renderUsers = (arr) => (
        arr.length !== 0 ?
            arr.map((item,i) =>(
                <div className="pot_friend" key={i}>
                    <div className="pot_friend_info">
                        <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                        </div>
                        <div className="pot_friend_nn">{item.nickname}</div>
                        <Link to={`private/${item._id}`} className="btn_to_chat">
                            Chat{this.countMessages(item._id,this.props.user.friends.messages)}
                        </Link>
                        <Popup
                            trigger={<button className="d_fr_btn">-</button>}
                            modal
                            contentStyle={{background:'rgb(233, 228, 228)',width:'280px',height:'160px'}}
                            closeOnDocumentClick
                        >
                            {close => (
                            <div>
                                <div>Delete {item.nickname} from friends?</div>
                                <button className='conf_delete' onClick={()=>this.props.delete(this.props.user.login.id,item._id,close)}>Delete</button>
                                <button className='conf_delete' onClick={close}>Cancel</button>
                            </div>
                            )}
                            
                        </Popup>
                    </div>
                </div>
            ))
        :
            <div>You have no friends :(</div>
    )

    //Show friends when loaded
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.login.friends !== this.props.user.login.friends) {
            nextProps.show(nextProps.user.login.id);
        }
    }
    
    render() {
        return (
            <div className="l_container">
                <h2>Your Friends:</h2>
                {this.renderUsers(this.props.user.friends.friends)}
                <hr/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        show: (id) => {
            dispatch(showFriends(id))
        },
        delete: (id,friend,close) => {
            dispatch(deleteFriend(id,friend));
            close()
        },
        clear: () => {
            dispatch(clearFriendList());
        },
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Friends);
