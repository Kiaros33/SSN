import React from 'react';
import { connect } from 'react-redux';

//Map outgoing requests to render then
const renderUser = (arr,id,cancelOut) => (
    arr.length !== 0 ?
        arr.map((item,i) =>(
            <div className="pot_friend" key={i}>
                <div className="pot_friend_info">
                    <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                    </div>
                    <div className="pot_friend_nn">{item.nickname}</div>
                    <button className="small_btn2" onClick={()=>cancelOut(id,item._id)}>-</button> 
                </div>
            </div>
        ))
    :
        <div>There are no active requests</div>
)

const Outgoing = (props) => (
    <div className="l_container">
        <h2>Outgoing requests</h2>
        {props.loading ? 'Loading...' : renderUser(props.user.requests.outReq,props.user.login.id,props.cancelOut)}
        <hr/>
    </div>
);

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Outgoing);
