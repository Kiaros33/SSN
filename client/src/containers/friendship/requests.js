import React, { Component } from 'react';
import { connect } from 'react-redux';
import Outgoing from '../../components/friendship/outgoing';
import Incoming from '../../components/friendship/incoming';
import {getAllReq,clearAllReq,cancelIn,acceptIn,cancelOut} from '../../actions';


//Container for outgoing and incoming
class Requests extends Component {

    state = {
        loading:true
    }

    componentWillMount() {
        this.props.loadAll(this.props.user.login.id)
    }

    componentWillUnmount() {
        this.props.clearAll()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.user.login !== nextProps.user.login) {
            this.props.loadAll(this.props.user.login.id)
        }
        this.setState({
            loading:false
        })
    }
    
    
    render() {
        return (
            <div>
                <Outgoing cancelOut={this.props.cancelOut} loading={this.state.loading}/>
                <Incoming cancelIn={this.props.cancelIn} acceptIn={this.props.accept} loading={this.state.loading}/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadAll: (id) => {
            dispatch(getAllReq(id));
        },
        clearAll: () => {
            dispatch(clearAllReq());
        },
        accept: (curUser,reqUser) => {
            dispatch(acceptIn(curUser,reqUser))
        },
        cancelOut: (curUser,reqUser) => {
            dispatch(cancelOut(curUser,reqUser))
        },
        cancelIn: (curUser,reqUser) => {
            dispatch(cancelIn(curUser,reqUser))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Requests);

