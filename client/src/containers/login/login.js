import React, { Component } from 'react';
import { connect } from 'react-redux';
import {login} from '../../actions';
import {Link} from 'react-router-dom';

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

                    {   
                        !this.props.user.login.isAuth ?
                            <div className="l_error">{this.state.error}</div>
                        :
                            null
                    }

                </form>
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
