import React, { Component } from 'react';
import {isAuth} from '../actions';
import { connect } from 'react-redux';


export default function (ComposedClass,reload) {
    class AuthenticationCheck extends Component {

        state = {
            loading:true
        }

        componentWillMount() {
            this.props.dispatch(isAuth())
        }
        
        componentWillReceiveProps(nextProps) {
            //check if Auth != 0
            this.setState({
                loading:false
            });

            if (!nextProps.user.login.isAuth && reload === true) {
                this.props.history.push('/login');
            }
            if(nextProps.user.login.isAuth && reload === false){
                this.props.history.push('/');
            }
        }
        
        render(){
            if (this.state.loading) {
                return <div className="loader">Loading...</div>
            }
            return(
                <ComposedClass {...this.props}/>
            )
        }
    }

    const mapStateToProps = (state) => {
        return {
            user: state.user
        }
    }

    return connect(mapStateToProps)(AuthenticationCheck)
};