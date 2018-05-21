import React from 'react';
import SideNav from 'react-simple-sidenav';
import NavItems from './navItems'

const Nav = (props) => {
    
    return (
        <SideNav
            showNav={props.showNav}
            onHideNav={props.onNav}
            navStyle={{
                background:'#242424',
                maxWidth:'220px'
            }}
        >
           <NavItems {...props}/>
        </SideNav>
    );
};

export default Nav;