const qs = (selector) => document.querySelector(selector);
const getProperies = (obj, attr) => {
    if(obj.hasOwnProperty(attr))
        return obj[attr];
    return null;
}

class ValidatorField{
    constructor(element, options){
        this.element = element;
        this.options = options;
        this.template = null;
        this.renderTemplate();
    }

    renderTemplate(){
        this.template = document.createElement('div');
        this.template.className = 'v-group';
        const label = this.element.getAttribute('data-label'); 
        if(label)
            this.template.append(this.createLabel(label))
        this.template.append(this.element);
        if(this.options.showErrors)
            this.template.append(this.createErrorContainer())
    }

    createLabel(value){
        const element = document.createElement('label');
        element.innerHTML = value;
        return element;
    }

    createErrorContainer(){
        const element = document.createElement('small');
        element.className = 'v-error';
        return element;
    }

    setError(error){
        if(this.options.showErrors){
            this.template.querySelector('.v-error').innerHTML = error;
        }
        this.element.classList.add('v-invalid');
    }

    removeError(){
        if(this.options.showErrors){
            this.template.querySelector('.v-error').innerHTML = '';
        }
        this.element.classList.remove('v-invalid');
    }

}

class ValidatorErrorsHandler{
    constructor(){
        this.errors = {};
        this.data = [];
        this.messages = {
            'required': 'This field is required',
            'prompt': `This field must be equal field :field`,
            'email': 'Invalid email format',
            'equal': 'This field must be equal :field'
        }
    }

    validate(d, scheme){
        const fields = Object.keys(scheme.rules);
        this.errors = {};
        this.data = d;

        fields.forEach(field => {
            if(this.data[field] == undefined)
                return;
            
            scheme.rules[field].forEach(rule => {
                if(this.errors.hasOwnProperty(field))
                    return;

                if(typeof(rule) == 'function'){
                    rule(field, this.data[field], this.errors);
                    return;
                }
                
                rule = rule.split(':').map(item => item.trim())
                if(!this[rule[0]](rule, field)){
                    let showedErrorFieldName = field;

                    if(['prompt', 'equal'].includes(rule[0]))
                        showedErrorFieldName = rule[1]

                    // this.errors[field] = getProperies(scheme.messages || {}, rule[0]) || this.errorFormat(this.messages[rule[0]], showedErrorFieldName)
                    this.errors[field] = this.errorFormat(getProperies(scheme.messages || {}, rule[0]) || this.messages[rule[0]], showedErrorFieldName)
                }

            });
        }); 
    }   

    errorFormat(error, field){
        return error.replace(/:field/gi, field)
    }

    required(rule, field){
        return this.data[field] ? true : false;
    }

    prompt(rule, field){
        const {data} = this;
        return  data[rule[1]] === data[field];
    }

    email(rule, field){
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            .test(String(this.data[field]).toLowerCase())
    }

    equal(rule, field){
        return this.data[field] == rule[1];
    }
}

class Validator{
    constructor(form, scheme){
        this.form = form;
        this.options = scheme.options || [];
        this.scheme = scheme;
        this.fields = {};
        this.fieldsRender();
        this.addEvents();
    }

    addEvents(){
        this.form.onsubmit = () => this.validate();
    }

    fieldsRender(){
        let fields = [...this.form.querySelectorAll('input'), ...this.form.querySelectorAll('select'), ...this.form.querySelectorAll('textarea')];
        
        const $container = document.createElement('div');
        $container.className = 'v-form-container';

        fields.forEach(item => {
            let name = item.getAttribute('name');
            const options = {
                showErrors: (getProperies(this.options, 'showErrors') != null) ? getProperies(this.options, 'showErrors') : true
            }
            if(name){
                this.fields[name] = new ValidatorField(item, options);
                $container.append(this.fields[name].template)
            }
        })
        
        if(this.form.querySelector('.v-form-container'))
            this.form.querySelector('.v-form-container').remove()

        this.form.prepend($container)    
    }

    validate(){
        const data = [];
        const validator = new ValidatorErrorsHandler();

        Object.keys(this.fields).forEach(name => data[name] = this.fields[name].element.value);
        validator.validate(data, this.scheme);

        Object.keys(this.fields).forEach(key => this.fields[key].removeError())

        if(Object.keys(validator.errors).length){
            this.showErrors(validator.errors)
            return false;
        }
    }

    showErrors(errors){
        Object.keys(errors).forEach(key => this.fields[key].setError(errors[key]))
    }
}