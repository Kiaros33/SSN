import React from 'react';
import { connect } from 'react-redux';
import Outgoing from '../../components/friendship/outgoing';
import Incoming from '../../components/friendship/incoming';

//Container for outgoing and incoming
const Requests = () => (
    <div>
        <Outgoing/>
        <Incoming/>
    </div>
);

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Requests);

