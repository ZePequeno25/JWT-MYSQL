const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.json({ message: 'API REST MVC com JWT, Joi e Bcrypt rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});