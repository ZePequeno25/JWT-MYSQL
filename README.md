# DOCUMENTAÇÃO DA API RESTful – ESTUDO PARA PROVA
## Node.js + Express + MVC + JWT + MySQL + Bcrypt + Joi

### 1. Visão Geral do Projeto (o que o professor mais cai na prova)
- Arquitetura MVC (Model-View-Controller) aplicada em API REST
- Autenticação segura com JWT (JSON Web Token)
- Senhas criptografadas com Bcrypt
- Validação de entrada com Joi
- Banco de dados MySQL com pool de conexões
- Rotas públicas (register, login) e protegidas (profile, update, delete, list)

### 2. Estrutura de Pastas (decore isso, sempre perguntam)

```
src/
├── config/
│   └── database.js          → conexão com MySQL (pool)
├── controllers/
│   └── userController.js   → lógica de negócio (register, login, profile...)
├── middleware/
│   └── authMiddleware.js    → verifica o token JWT em rotas protegidas
├── models/
│   └── userModel.js         → consultas SQL (CREATE, READ, UPDATE, DELETE)
├── routes/
│   └── userRoutes.js        → define as rotas da API
├── validations/
│   └── userValidation.js    → regras de validação com Joi
├── .env                     → variáveis de ambiente (nunca no Git!)
└── index.js                 → entrada da aplicação (servidor Express)
```

### 3. Fluxo Completo de uma Requisição (exemplo: register)

1. Requisição chega em → routes/userRoutes.js
2. Vai para → controllers/userController.js (método register)
3. Validação com Joi → se inválido → 400 Bad Request
4. Verifica se e-mail já existe → models/userModel.js (findByEmail)
5. Criptografa senha com bcrypt.hash()
6. Insere no banco → models/userModel.js (create)
7. Gera token JWT → jwt.sign({ id }, SECRET, { expiresIn })
8. Retorna 201 + token + dados do usuário

### 4. Explicação detalhada de cada arquivo

#### config/database.js
```js
const mysql = require('mysql2/promise');
```
- Cria um pool de conexões (mais eficiente que conexão única)
- Usa variáveis do .env (DB_HOST, DB_USER, etc)
- Exporta o pool para ser usado em todo o projeto

#### models/userModel.js → Camada Model (acesso ao banco)
- create() → INSERT com bcrypt.hash()
- findByEmail() → SELECT * WHERE email = ?
- findById() → SELECT sem senha (segurança!)
- getAll(), update(), delete() → CRUD completo
- Usa await pool.execute() → prepared statements (previne SQL Injection)

#### validations/userValidation.js → Camada de Validação
```js
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  password_confirm: Joi.ref('password')
});
```
- Garante dados válidos antes de tocar no banco
- Evita erros e ataques

#### middleware/authMiddleware.js → Proteção das rotas
```js
1. Pega o header Authorization: Bearer <token>
2. jwt.verify(token, SECRET)
3. Se válido → coloca req.user = { id } e chama next()
4. Se inválido → 401 ou 403
```

#### controllers/userController.js → Camada Controller (lógica)
Funções principais:
- register → valida → verifica duplicidade → cria → gera token
- login → valida → busca usuário → bcrypt.compare() → gera token
- profile → req.user.id vem do middleware → busca usuário → retorna dados

#### routes/userRoutes.js
```js
router.post('/register', userController.register);     // pública
router.post('/login',    userController.login);        // pública
router.get('/profile', authMiddleware, userController.profile); // protegida
```

#### index.js
- Configura Express
- app.use(express.json())
- app.use('/api/users', userRoutes)
- Inicia na porta 3000

### 5. Como funciona o JWT na prática (decore isso!)

1. Cliente faz login → servidor gera token:
   ```js
   jwt.sign({ id: 5 }, "segredo", { expiresIn: '24h' })
   ```
2. Cliente guarda o token (localStorage, cookie, etc)
3. Em toda requisição protegida envia:
   ```
   Authorization: Bearer eyJhbGciOi...
   ```
4. Middleware verifica → libera ou bloqueia

### 6. Segurança aplicada

| Recurso       | O que protege                          | Onde está no código        |
|---------------|----------------------------------------|----------------------------|
| Bcrypt        | Senhas nunca ficam em texto puro       | models/userModel.js        |
| JWT           | Sessão sem usar banco/cookies         | controllers + middleware   |
| Joi           | Entrada inválida ou maliciosa          | validations/               |
| Pool MySQL    | Evita conexões lentas/excessivas       | config/database.js         |
| Prepared statements | Previne SQL Injection            | todos os models            |
| .env          | Credenciais fora do código             | raiz do projeto            |

### 7. Endpoints da API

| Método | Rota                   | Protegida? | Descrição                     |
|--------|------------------------|------------|-------------------------------|
| POST   | /api/users/register    | Não        | Cria usuário + retorna token  |
| POST   | /api/users/login       | Não        | Faz login + retorna token     |
| GET    | /api/users/profile     | Sim        | Mostra dados do usuário logado|
| GET    | /api/users             | Sim        | Lista todos os usuários       |
| PUT    | /api/users/:id         | Sim        | Atualiza dados/senha          |
| DELETE | /api/users/:id         | Sim        | Deleta conta                  |


pergunta dissertativa, escreva mais ou menos assim:

> "A API segue o padrão MVC onde os controllers recebem as requisições, os models interagem com o MySQL usando pool de conexões e declarações preparadas, e o middleware de autenticação verifica o JWT em rotas protegidas. As senhas são armazenadas com hash bcrypt, a entrada é validada com Joi e as credenciais do banco ficam seguras no arquivo .env. Essa arquitetura garante separação de responsabilidades, segurança e escalabilidade."
