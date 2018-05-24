import React from 'react';
import Header from '../components/header/header';

//High order component to wrap everything with header
const Layout = (props) => {
    return (
        <div>
            <Header/>
            <div>
                {props.children}
            </div>
        </div>
    );
};

export default Layout;