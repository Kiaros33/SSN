import reducer from '../../src/reducers/usersReducer';

describe('user reducer',() => {

    it('should user the right case', ()=>{
        const action = {
            type:'USER_REGISTER',
            payload:{
                success:true,
                user:{
                    email:'email@mail.ru',
                    password:'Password123'
                }
            }
        }

        expect(reducer(undefined,action)).toMatchObject({
            register: {
                success: true, 
                user: {
                    email: "email@mail.ru", 
                    password: "Password123"
                }
            }
        })
    })
})