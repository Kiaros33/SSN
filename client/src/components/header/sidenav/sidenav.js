import React from 'react';
import SideNav from 'react-simple-sidenav';
import NavItems from './navItems'

//Side nav common settings here
const Nav = (props) => {

    return (
        <SideNav
            showNav={props.showNav}
            onHideNav={props.onNav}
            navStyle={{
                background:'#242424',
                maxWidth:'150px'
            }}
        >
           <NavItems {...props}/>
        </SideNav>
    );
};

export default Nav;