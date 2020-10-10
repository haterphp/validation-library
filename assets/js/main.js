const rules = {
    form_1:{
        rules:{
            login: ['required', (attr, value, errors) => { 
                if(value != 'foo')
                    errors['login'] = 'This field must be equal foo'
            }],
            email: ['email', 'equal: tatar@mail.ru'],
            password: ['required', 'prompt: password_repeat'],
            textarea: ['required']
        }
    },
    form_2:{
        rules:{
            email: ['required', 'email'],
            password: ['required',]
        },
        messages:{
            required: 'Поле обязательное',
            email: 'Неверный формат почты'
        }
    }
}

const form_1 = new Validator('#form-1', rules['form_1'])
const form_2 = new Validator('#form-2', rules['form_2'])