import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getAllIn,cancelIn,acceptIn} from '../../actions';

class Incoming extends Component {

    //Get all incoming requests of current user
    componentWillMount() {
        this.props.dispatch(getAllIn(this.props.user.login.id));
    }

    //Accept invite
    acceptInvite = (curUser,reqUser) => {
        this.props.dispatch(acceptIn(curUser,reqUser))
    }

    //Reject invite
    cancelInvite = (curUser,reqUser) => {
        this.props.dispatch(cancelIn(curUser,reqUser))
    }

    //Map incoming requests for render then
    renderUser = (arr) => (
        arr.length !== 0 ?
            arr.map((item,i) =>(
                <div className="pot_friend" key={i}>
                    <div className="pot_friend_info">
                        <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                        </div>
                        <div className="pot_friend_nn">{item.nickname}</div>
                        <button className="small_btn2" onClick={()=>this.acceptInvite(this.props.user.login.id,item._id)}>+</button> 
                        <button className="small_btn2" onClick={()=>this.cancelInvite(this.props.user.login.id,item._id)}>-</button> 
                    </div>
                </div>
            ))
        :
            <div>There are no active requests</div>
    )

    //Show incoming requests when loaded
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.login.inRequests !== this.props.user.login.inRequests) {
            nextProps.dispatch(getAllIn(nextProps.user.login.id));
        }
    }

    render() {
        return (
            <div className="l_container">
                <h2>Incoming requests</h2>
                {
                    this.props.user.inRequests && this.props.user.inRequests.users?
                    this.renderUser(this.props.user.inRequests.users)
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

export default connect(mapStateToProps)(Incoming);