import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom';
import {friendSearch,friendInvite} from '../../actions';

class Search extends Component {

    state = {
        searchFor:'',
        potentialFriendImage:'',
        potentialFriendNickname:'',
        error:'',
        requested:false
    }

    //Search input handler (controlled input)
    handleInputSearch = (event) => {
        if(event.target.value !== ""){
            this.setState({
                requested:false
            })
        }
        this.setState({
            searchFor:event.target.value
        })
    }

    //Search for e-mail on submit
    submitForm = (event) => {
        event.preventDefault();
        if (this.state.searchFor !== '') {
            this.props.dispatch(friendSearch(this.state.searchFor))
        }
        
    }

    //Send request on invite press
    handleInvite = () => {
        if (!this.state.error && this.state.potentialFriendImage && this.state.potentialFriendNickname) {
            this.props.dispatch(friendInvite(this.props.user.login.id,this.props.user.friendship.user.id));
            this.setState({
                searchFor:'',
                potentialFriendImage:'',
                potentialFriendNickname:'',
                requested:true
            })
        }
    }

    //Show user info if found
    componentWillReceiveProps(nextProps) {
        if (nextProps.user.friendship.message) {
            this.setState({
                potentialFriendImage:'',
                potentialFriendNickname:'',
                error:nextProps.user.friendship.message
            })
        }
        if (nextProps.user.friendship.searchSuccess && nextProps.user.friendship.user) {
            this.setState({
                potentialFriendImage:nextProps.user.friendship.user.image,
                potentialFriendNickname:nextProps.user.friendship.user.nickname,
                error:''
            })
        }
    }
    
    render() {
        return (
            <div className="l_container">
                <h2>Search for new friends</h2>
                <form onSubmit={this.submitForm}>
                    <div className="form_element">
                        <input type="email" placeholder="Your friend e-mail" value={this.state.searchFor} onChange={this.handleInputSearch}/>
                    </div>
                    <button type="submit">Search</button>
                    {
                        this.state.potentialFriendImage ?
                            <div className="pot_friend">
                                <div className="pot_friend_info">
                                    <div className='img_small' style={{backgroundImage:`url('${this.state.potentialFriendImage}')`,backgroundSize:'cover', backgroundPosition:'center'}}>
                                    </div>
                                    <div className="pot_friend_nn">{this.state.potentialFriendNickname}</div>
                                    <button className="small_btn" onClick={this.handleInvite}>Invite</button>
                                </div>
                            </div>
                        :
                            null
                    }
                    <div className="l_error">{this.state.error}</div>
                    {
                        this.state.requested && !this.state.searchFor && !this.state.error?
                            <div className="l_success">Request sended: <Link to="/requests">check here!</Link></div>
                        :
                            null
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

export default connect(mapStateToProps)(Search);
