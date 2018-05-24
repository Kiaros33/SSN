import React from 'react';
import axios from 'axios';

const Logout = (props) => {

    //Logout bypassing redux...Push to login page
    axios.get(`/api/logout`)
    .then(request=>{
        setTimeout(() => {
            props.history.push('/login')
        }, 2000);
    })

    return (
        <div className="l_success">
            Sorry to see you go :(
        </div>
    );
};

export default Logout;