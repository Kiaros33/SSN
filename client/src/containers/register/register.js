import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {register,login,clearReg} from '../../actions';

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
        this.setState({
            email:event.target.value
        },()=>{
            if(!this.state.email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)){
                this.setState({
                    eError: "E-mail is not valid so far"
                })
            }
            else{
                this.setState({
                    eError: ""
                })
            }
        })
    }

    //Password input handler (controlled input) / client-side simple validation on fly
    handleInputPassword = (event) => {
        this.setState({
            password:event.target.value
        }, () => {
            let defaultError = "Password must contains "
            if(this.state.password.match(/[A-Z]/) == null){
                let capError = "1 capital letter | ";
                defaultError += capError;
                this.setState({
                    pError:defaultError
                })
            }
            if (this.state.password.match(/[a-z]/) == null) {
                let lowError = "1 lower letter | ";
                defaultError += lowError;
                this.setState({
                    pError:defaultError
                })
            } 
            if (this.state.password.match(/[0-9]/) == null) {
                let digError = "1 digit | ";
                defaultError += digError;
                this.setState({
                    pError:defaultError
                })
            } 
            if (this.state.password.length < 6) {
                let lenError = "6 characters |";
                defaultError += lenError;
                this.setState({
                    pError:defaultError
                })
            }
            if (defaultError === "Password must contains "){
                this.setState({
                    pError:''
                })
            }
            
        })
    }

    //Nickname input handler (controlled input)
    handleInputNickname = (event) => {
        this.setState({
            nickname:event.target.value
        },()=>{
            if (this.state.nickname === "") {
                this.setState({
                    nError:"Nickname is required"
                })
            }
            else{
                this.setState({
                    nError:""
                })
            }
        })
    }

    //Try to register new user on submit
    submitForm = (event) => {
        event.preventDefault();
        this.props.dispatch(register({
            nickname:this.state.nickname,
            email:this.state.email,
            password:this.state.password
            }));
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
        if(this.props.user.register && this.props.user.register.err){
            if (this.props.user.register.err.code === 11000) {
                return (
                    <div className="l_error">
                        Sorry, but user with entered e-mail already exists
                    </div>
                )
            }
        }
    }

    //Clear inputs on unmount
    componentWillUnmount() {
        this.props.dispatch(clearReg());
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
                        this.props.user.register && this.props.user.register.success ?
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

