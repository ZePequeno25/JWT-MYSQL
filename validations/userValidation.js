const Joi = require('joi');

const registerSchema = Joi.object({ 
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    password_confirm: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'As senhas não coincidem'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const updateSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    password_confirm: Joi.string().valid(Joi.ref('password')).messages({
        'any.only': 'As senhas não coincidem'
    })
}).min(1); //pelo menos um campo deve ser preenchido

module.exports = { registerSchema, loginSchema, updateSchema };