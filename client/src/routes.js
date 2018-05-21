import React from 'react';
import { Switch, Route } from "react-router-dom";
import Layout from './HOC/layout';
import Auth from './HOC/auth';
import Login from './containers/login/login';
import Register from './containers/register/register';
import Profile from './components/profile/profile';
import Logout from './components/profile/logout';
import Friends from './components/friendship/friends';
import Requests from './components/friendship/requests';
import Home from './components/home/home';
import Private from './components/chat/private';
import Search from './containers/friendship/search';


const Routes = () => (
    <Layout>
        <Switch>
            <Route path="/" exact component={Auth(Home,true)}/>
            <Route path="/login" exact component={Auth(Login,false)}/>
            <Route path="/register" exact component={Auth(Register,false)}/>
            <Route path="/profile" exact component={Auth(Profile,true)}/>
            <Route path="/logout" exact component={Auth(Logout,true)}/>
            <Route path="/friends" exact component={Auth(Friends,true)}/>
            <Route path="/search" exact component={Auth(Search,true)}/>
            <Route path="/requests" exact component={Auth(Requests,true)}/>
            <Route path="/private/:conv" exact component={Auth(Private,true)}/>
        </Switch>
    </Layout>
);

export default Routes;