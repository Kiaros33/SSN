import React, { Component } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import Nav from './sidenav/sidenav';

class Header extends Component {

    state = {
        showNav:false
    }

    //Close or show nav depending on current state
    onNav = ()=>{
        const navState = this.state.showNav;
        if (navState) {
            this.setState({showNav:false})
        }
        else{
            this.setState({showNav:true})
        }
    }

    //Render nav and header with a link to home page
    render() {
        return (
            <div>
                <div id="place_holder"/>
                <header>
                    
                    <div className="open_nav">
                        <FontAwesome name="bars" style={{color:'#dddddd', padding:'10px', cursor:'pointer'}} onClick={()=>this.onNav()}/>
                    </div>
                    <Nav 
                        showNav={this.state.showNav}
                        onNav={()=>this.onNav()}
                    />
                    <Link to="/" className="logo">
                        SSN
                    </Link>
                    
                </header>
            </div>
            
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Header);
