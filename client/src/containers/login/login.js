import React, { Component } from 'react';
import { connect } from 'react-redux';
import {login} from '../../actions';
import {Link} from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import {googleRegLog} from '../../actions';
import FontAwesome from 'react-fontawesome';

class Login extends Component {

    state = {
        email:'',
        password:'',
        error:''
    }

    handleInputEmail = (event) => {
        this.setState({
            email:event.target.value
        })
    }

    handleInputPassword = (event) => {
        this.setState({
            password:event.target.value
        })
    }

    submitForm = (event) => {
        event.preventDefault();
        this.props.dispatch(login({
            email:this.state.email,
            password:this.state.password
            }));
    }

    componentWillReceiveProps(nextProps) {
        if(!nextProps.user.login.isAuth){
            this.setState({
                error:nextProps.user.login.message
            })
        }
        else{
            setTimeout(()=>{
                this.props.history.push('/')
            },1000);
        }
    }

    responseGoogle = (response) => {
        this.props.dispatch(googleRegLog(response.tokenId))
    }

    render() {
        return (
            <div className="l_container">
                <form action="" onSubmit={this.submitForm}>

                    <h2>Log-in</h2>

                    <div className="form_element">
                        <input type="email" placeholder="Enter an e-mail" value={this.state.email} onChange={this.handleInputEmail}/>
                    </div>

                    <div className="form_element">
                        <input type="password" placeholder="Enter a password" value={this.state.password} onChange={this.handleInputPassword}/>
                    </div>

                    <button type="submit">Go in</button>
                    <Link to="/register"><button>Register now!</button></Link>

                    
                </form>
                <div>
                    <GoogleLogin
                        clientId="945274229124-5astasev3jr15rohtv5a4l24g5qmubki.apps.googleusercontent.com"
                        onSuccess={this.responseGoogle}
                        style={{background:'rgb(220, 78, 65)',
                        display: 'block',
                        fontSize: '20px',
                        padding: '10px 52px',
                        color: '#dddddd',
                        fontWeight: '300',
                        borderRadius: '3px',
                        border: 'none',
                        margin: '10px auto',
                        width: '260px'}}>
                        <FontAwesome name='google'/>
                    </GoogleLogin>
                </div>
                {   
                    !this.props.user.login.isAuth ?
                        <div className="l_error">{this.state.error}</div>
                    :
                        null
                }
                    
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user:state.user
    }
}

export default connect(mapStateToProps)(Login);
