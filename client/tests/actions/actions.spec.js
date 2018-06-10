import * as actions from '../../src/actions/index';
import mockAxios from 'jest-mock-axios';

afterEach(() => {
    mockAxios.reset();
});

it('Should call /api/login/ with the USER_LOGIN response.data.type', () => {

    let clientMessage = {
        email:'user@mail.ru',
        password:'Password123'
    };
    
    expect(actions.login({email:'user@mail.ru', password:'Password123'})).toMatchObject({type: 'USER_LOGIN'})
    expect(mockAxios.post).toHaveBeenCalledWith('/api/login/', clientMessage);
});
