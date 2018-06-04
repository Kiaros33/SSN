import React from 'react';
import { connect } from 'react-redux';

//Map incoming requests for render then
const renderUser = (arr,id,acceptIn,cancelIn) => (
    arr.length !== 0 ?
        arr.map((item,i) =>(
            <div className="pot_friend" key={i}>
                <div className="pot_friend_info">
                    <div className='img_small' style={{backgroundImage:`url('${item.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                    </div>
                    <div className="pot_friend_nn">{item.nickname}</div>
                    <button className="small_btn2" onClick={()=>acceptIn(id,item._id)}>+</button> 
                    <button className="small_btn2" onClick={()=>cancelIn(id,item._id)}>-</button> 
                </div>
            </div>
        ))
    :
        <div>There are no active requests</div>
)

const Incoming = (props) => (
    <div className="l_container">
        <h2>Incoming requests</h2>
        {renderUser(props.user.requests.inReq,props.user.login.id,props.acceptIn,props.cancelIn)}
        <hr/>
    </div>
);

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Incoming);