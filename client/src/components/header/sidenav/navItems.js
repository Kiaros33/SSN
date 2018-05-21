import React from 'react';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router-dom';
import { connect } from 'react-redux';

const NavItems = ({user}) => {
    const items = [
        {
            type:'navItem',
            icon:'home',
            text:'Home',
            link:'/',
            restricted:true
        },
        {
            type:'navItem',
            icon:'user',
            text:'Profile',
            link:'/profile',
            restricted:true
        },
        {
            type:'navItem',
            icon:'group',
            text:'Friends',
            link:'/friends',
            restricted:true
        },
        {
            type:'navItem',
            icon:'user-plus',
            text:'Add friend',
            link:'/search',
            restricted:true
        },
        {
            type:'navItem',
            icon:'exchange',
            text:'Requests',
            link:'/requests',
            restricted:true
        },
        {
            type:'navItem',
            icon:'sign-in',
            text:'Log-in',
            link:'/login',
            restricted:false,
            exclude:true
        },
        {
            type:'navItem',
            icon:'check',
            text:'Register',
            link:'/register',
            restricted:false,
            exclude:true
        },
        {
            type:'navItem',
            icon:'sign-out',
            text:'Log-out',
            link:'/logout',
            restricted:true
        }
    ]

    const splitElements = (item,i) => (
        <div key={i} className={item.type}>
            <Link to={item.link}>
                <FontAwesome name={item.icon}/>
                {item.text}
            </Link>
        </div>
    )

    const showItems = () => (
        user.login ?
            items.map((item,i)=>{
                if (user.login.isAuth) {
                    return !item.exclude ?
                        splitElements(item,i)
                    :
                        null
                }
                else{
                    return !item.restricted ?
                        splitElements(item,i)
                    :
                        null
                }
            })
        :
            null
    )

    return (
        <div>
            {showItems()}
        </div>
    );
};

 const mapStateToProps = (state) => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(NavItems);

