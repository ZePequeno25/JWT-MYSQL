const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, userController.profile);
router.get('/', authMiddleware, userController.getAll);
router.put('/:id', authMiddleware, userController.update);
router.delete('/:id', authMiddleware, userController.delete);

module.exports = router;