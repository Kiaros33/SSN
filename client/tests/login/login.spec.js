import React from 'react';
import Login from '../../src/containers/login/login';
import * as actions from '../../src/actions/index';
import {Link,Route,MemoryRouter} from 'react-router-dom';
import {shallow,mount,render} from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import renderer from 'react-test-renderer'

describe('<Login/> tests',()=>{
    const initialState = {
        user:{
            login:{
                error:true,
                message:"You are not logged in"
            }
        }
    };
    const mockStore = configureStore([thunk]);
    let store = mockStore(initialState);

    it('should render correctly',() => {
        const wrapper = shallow(<Login store={store}/>);

        expect(wrapper.prop('store').getState().user).toEqual(initialState.user); //check initialStore
        const email = wrapper.dive().find('input.email');
        const pass = wrapper.dive().find('input.pass');
        const submit = wrapper.dive().find('button').first();

        email.simulate('change',{target:{value:'user@mail.ru'}}); //do call input handler , but does not change the state...
        pass.simulate('change',{target:{value:'Password123'}}); //do call input handler , but does not change the state...

        wrapper.setState({
            email:'user@mail.ru',
            password:'Password123'
        }); //changing state manually

        expect(wrapper.state().email).toBe('user@mail.ru'); //check the state
        expect(wrapper.state().password).toBe('Password123'); //check the state
    })

    it('should match the snapshot',() => {
        const renderedValue = renderer.create(
        <MemoryRouter>
            <Route path="/login">
                <Login store={store}/>
            </Route>
        </MemoryRouter>).toJSON();
        expect(renderedValue).toMatchSnapshot();
    })

    
})
