import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {register,login} from '../../actions';
import pValidator from '../../validation/password';
import eValidator from 'email-validator'

class Register extends PureComponent {

    state = {
        nickname:'',
        email:'',
        password:'',
        nError:'Nickname is required',
        eError:'E-mail is required',
        pError:'Password is required'
    }

    //E-mail input handler (controlled input) / client-side simple validation on fly
    handleInputEmail = (event) => {
        if(event.target.value !== ''){
            if(!eValidator.validate(event.target.value)){
                this.setState({
                    eError: 'E-mail is not valid so far'
                })
            }
            else{
                this.setState({
                    eError: ''
                })
            }
        }
        else{
            this.setState({
                eError: 'E-mail is required'
            })
        }

        this.setState({
            email:event.target.value
        })
    }

    //Password input handler (controlled input) / client-side simple validation on fly
    handleInputPassword = (event) => {
        if(event.target.value !== ''){
            let validation = pValidator.validate(event.target.value,{list:true});

            if(validation.length === 0){
                this.setState({
                    pError: ''
                })
            }
            else{
                let newError = 'Must contains: ';
                for (let i = 0; i < validation.length; i++) {
                    if (validation[i] === "min") {
                        newError += "6 characters. "
                    }
                    if (validation[i] === "lowercase") {
                        newError += "1 lower letter. "
                    }
                    if (validation[i] === "digits") {
                        newError += "1 digit. "
                    }
                    if (validation[i] === "uppercase") {
                        newError += "1 capital letter. "
                    }  
                }
                this.setState({
                    pError: newError
                })

            }
        }
        else{
            this.setState({
                pError: 'Password is required'
            })
        }

        this.setState({
            password:event.target.value
        })
    }

    //Nickname input handler (controlled input)
    handleInputNickname = (event) => {
        if (event.target.value === "") {
            this.setState({
                nError:"Nickname is required"
            })
        }
        else{
            this.setState({
                nError:""
            })
        }
        this.setState({
            nickname:event.target.value
        })
    }

    //Try to register new user on submit
    submitForm = (event) => {
        event.preventDefault();
        if(!this.state.nError && !this.state.eError && !this.state.pError){
            this.props.dispatch(register({
                nickname:this.state.nickname,
                email:this.state.email,
                password:this.state.password
            }));
        }
    }

    //Login if registered
    redirectOnSuccess = () => {
        this.props.dispatch(login({
            email:this.state.email,
            password:this.state.password
            }));
    }

    //Notificate user if registration failed
    stayOnError = () => {
        if (this.props.user.register.response.data.code === 11000) {
            return (
                <div className="l_error">
                    Sorry, but user with entered e-mail already exists
                </div>
            )
        }   
    }

    render() {
        return (
            <div className="l_container">
                
                <form action="" onSubmit={this.submitForm}>

                    <h2>Registration</h2>

                    <div className="form_element">
                        <input type="text" placeholder="Nickname" value={this.state.nickname} onChange={this.handleInputNickname}/>
                    </div>

                    <div className="l_error">
                        {this.state.nError}
                    </div>

                    <div className="form_element">
                        <input type="email" placeholder="E-mail" value={this.state.email} onChange={this.handleInputEmail}/>
                    </div>

                    <div className="l_error">
                        {this.state.eError}
                    </div>

                    <div className="form_element">
                        <input type="password" placeholder="Password" value={this.state.password} onChange={this.handleInputPassword}/>
                    </div>

                    <div className="l_error">
                        {this.state.pError}
                    </div>

                    <button type="submit">Reg me</button>
                    
                    {   
                        this.props.user.register.success ?
                        this.redirectOnSuccess()
                        :
                        this.stayOnError()
                    }
                    
                    
                </form>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(Register);

