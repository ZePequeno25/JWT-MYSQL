const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { registerSchema, loginSchema, updateSchema } = require('../validations/userValidation');
require('dotenv').config();


const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};
const userController = {
    
    // POST /api/users/register
    register: async (req, res) => {
        console.log('Chegou no register:', req.body); // vai aparecer no terminal
    
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });
    
        const { name, email, password } = req.body;
    
        try {
          const existingUser = await User.findByEmail(email);
          if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado' });
    
          console.log('Vai criar usuário...');
          const user = await User.create({ name, email, password });
          console.log('Usuário criado:', user);
    
          const token = generateToken(user.id);
    
          res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: { id: user.id, name: user.name, email: user.email }
          });
        } catch (err) {
          console.error('ERRO NO REGISTER:', err); // aqui aparece exatamente o erro
          res.status(500).json({ error: 'Erro no servidor', details: err.message });
        }
    },

    // POST /api/users/login
    login: async (req, res) => {
        console.log('Chegou no login:', req.body);

        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        
        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            console.log('Vai logar com usuário...');
            const token = generateToken(user.id);
            return res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        } catch (err) {
            res.status(500).json({ error: 'Erro no servidor' });
        }
    },

    // GET /api/users/profile (protegida)
    profile: async (req, res) => {
        const user = await User.findById(req.user.id);
        res.json(user);
    },

    // GET /api/users (protegida - listar todos)
    getAll: async (req, res) => {
        const users = await User.getAll();
        res.json(users);
    },

    // PUT /api/users/:id (protegida)
    update: async (req, res) => {
        const { error } = updateSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        try {
            await User.update(req.params.id, req.body);
            const updatedUser = await User.findById(req.params.id);
            res.json({ message: 'Atualizado!', user: updatedUser });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao atualizar' });
        }
    },

    // DELETE /api/users/:id (protegida)
    delete: async (req, res) => {
        try {
            await User.delete(req.params.id);
            res.json({ message: 'Usuário excluído com sucesso' });
        }catch (err) {
            res.status(500).json({ error: 'Erro ao excluir' });
        }
    }
};

module.exports = userController;