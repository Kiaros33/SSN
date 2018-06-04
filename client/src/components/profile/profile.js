import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {editUser} from '../../actions';
import pValidator from '../../validation/password';

class Profile extends PureComponent {

    state= {
        id:this.props.user.login.id,
        nickname:'',
        image:this.props.user.login.image,
        password:'',
        file:'',
        pError:'',
        message:'',
        error:'',
        iError:''
    }

    //Nickname input handler (controlled input)
    handleInputNickname = (event) => {
        this.setState({
            nickname:event.target.value
        })
    }

    //Password input handler (controlled input) / Client-side simple validation on the fly
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
                pError: ''
            })
        }

        this.setState({
            password:event.target.value
        })
    }

    //Image upload handler / Size and type validation
    handleInputImage = (event) => {
        this.setState({
            file:event.target.files[0]
        })

        if(event.target.files[0]){
            if (event.target.files[0].size > 3145728 || event.target.files[0].type.split('/')[0] !== 'image') {
                this.setState({
                    iError:'Maximum image size is 3Mb and image type should be image'
                })
            }
            else{
                this.setState({
                    iError:''
                })
            }
        }
    }

    //Try to save user changes on submit
    submitForm = (event) => {
        event.preventDefault();
        if(!this.state.iError && !this.state.error && !this.state.pError){
            this.props.dispatch(editUser({
                id:this.state.id,
                nickname:this.state.nickname,
                password:this.state.password,
                //Image name as user id and original extension to save in user model
                image:this.state.file ? 'https://s3.amazonaws.com/ssn-data-images/uploads/'+ this.state.id + this.state.file.size + '.' + this.state.file.name.split('.')[1] : '',
                oldImage: this.props.user.login.image,
                //File and filename to upload on server
                file:this.state.file ? this.state.file : '',
                fileName: this.state.file ? this.state.id + this.state.file.size + '.' + this.state.file.name.split('.')[1] : ''
            }))
        }
    }

    //If changes accepted - clear inputs/notificate user
    componentWillReceiveProps(nextProps) {
        if(nextProps.user.login.success === true){
            this.setState({
                nickname:'',
                password:'',
                message:'Changes Accepted',
                file:'',
                error:''
            })
        }
    }
    
    render() {
        return (
            <div className="l_container">
                <h1>Personal Info</h1>
                <div className='img' style={{backgroundImage:`url('${this.props.user.login.image}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                </div>
                <div>
                    <span>If you dont want to change</span><br/>
                    <span>any field - just leave it blank</span>
                </div>
                <form onSubmit={this.submitForm}>
                    <label className="button">
                        {
                            this.state.file ? this.state.file.name : 'Image...'
                        }
                        <input type="file" name="image" onChange={this.handleInputImage} style={{display:'none'}}/>
                    </label>
                    <div className="l_error">{this.state.iError}</div>

                    <div className="form_element">
                        <input type="password" placeholder={`Password: password?`} value={this.state.password} onChange={this.handleInputPassword}/>
                    </div>

                    <div className="l_error">
                        {this.state.pError}
                    </div>

                    <div className="form_element">
                        <input type="text" placeholder={`Nickname: ${this.props.user.login.nickname}`} value={this.state.nickname} onChange={this.handleInputNickname}/>
                    </div>

                    <div className="l_success">{this.state.message}</div>
                    <div className="l_error">{this.state.error}</div>

                    <button type="submit">Save changes</button>
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
export default connect(mapStateToProps)(Profile);
