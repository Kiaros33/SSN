import React, { Component } from 'react';
import { connect } from 'react-redux';
import {showFriends,deleteFriend} from '../../actions';
import {Link} from 'react-router-dom';



class Friends extends Component {

    
    componentWillMount() {
        this.props.dispatch(showFriends(this.props.user.login.id))
    }

    delFr = (curUser,friend) =>{
        this.props.dispatch(deleteFriend(curUser,friend))
    }

    renderUsers = (arr) => (
        arr.length !== 0 ?
            arr.map((item,i) =>(
                <div className="pot_friend" key={i}>
                    <div className="pot_friend_info">
                        <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                        </div>
                        <div className="pot_friend_nn">{item.nickname}</div>
                        <Link to={`private/${item._id}`} className="btn_to_chat">
                            Chat
                        </Link>
                        <button className="d_fr_btn" onClick={()=>this.delFr(this.props.user.login.id,item._id)}>-</button> 
                    </div>
                </div>
            ))
        :
            <div>You have no friends :(</div>
    )

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.login.friends !== this.props.user.login.friends) {
            nextProps.dispatch(showFriends(nextProps.user.login.id));
        }
    }
    
    
    render() {
        return (
            <div className="l_container">
                <h2>Your Friends:</h2>
                {
                    this.props.user.friends && this.props.user.friends.friends?
                    this.renderUsers(this.props.user.friends.friends)
                    :
                    null
                        
                }
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

export default connect(mapStateToProps)(Friends);
