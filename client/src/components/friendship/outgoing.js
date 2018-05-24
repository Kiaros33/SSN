import React, { Component } from 'react';
import { connect } from 'react-redux';
import {getAllOut,cancelOut} from '../../actions';

class Outgoing extends Component {

    //Get all outgoing requests of current user
    componentWillMount() {
        this.props.dispatch(getAllOut(this.props.user.login.id));
    }

    //Withdraw outgoing request
    cancelInvite= (curUser,reqUser) => {
        this.props.dispatch(cancelOut(curUser,reqUser));
    }
    
    //Map outgoing requests to render then
    renderUser = (arr) => (
        arr.length !== 0 ?
            arr.map((item,i) =>(
                <div className="pot_friend" key={i}>
                    <div className="pot_friend_info">
                        <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                        </div>
                        <div className="pot_friend_nn">{item.nickname}</div>
                        <button className="small_btn2" onClick={()=>this.cancelInvite(this.props.user.login.id,item._id)}>-</button> 
                    </div>
                </div>
            ))
        :
            <div>There are no active requests</div>
    )

    //Show outgoing requests when loaded
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.login.outRequests !== this.props.user.login.outRequests) {
            nextProps.dispatch(getAllOut(nextProps.user.login.id));
        }
    }


    render() {
        return (
            <div className="l_container">
                <h2>Outgoing requests</h2>
                {
                    this.props.user.outRequests && this.props.user.outRequests.users?
                    this.renderUser(this.props.user.outRequests.users)
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

export default connect(mapStateToProps)(Outgoing);
