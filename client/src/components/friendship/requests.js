import React, { Component } from 'react';
import { connect } from 'react-redux';
import Outgoing from '../../containers/friendship/outgoing';
import Incoming from '../../containers/friendship/incoming';


class Requests extends Component {



    render() {
        return (
            <div>


                <Outgoing/>
                <Incoming/>


            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Requests);
