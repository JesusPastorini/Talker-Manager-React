const express = require('express');
const crypto = require('crypto');
const { readTalker } = require('./utils/readTalker');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar 
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// Função auxiliar para validar o campo de email
const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    throw new Error('O campo "email" é obrigatório');
  }

  if (!email.match(/^\S+@\S+\.\S+$/)) {
    throw new Error('O "email" deve ter o formato "email@email.com"');
  }
};

// Função auxiliar para validar o campo de password
const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    throw new Error('O campo "password" é obrigatório');
  }

  if (password.length < 6) {
    throw new Error('O "password" deve ter pelo menos 6 caracteres');
  }
};

// Middleware para validar os campos obrigatórios
const validateFields = (req, res, next) => {
  try {
    const { email, password } = req.body;

    validateEmail(email);
    validatePassword(password);

    next();
  } catch (err) {
    res.status(HTTP_BAD_REQUEST_STATUS).json({ message: err.message });
  }
};

// Middleware para gerar um token aleatório
const generateRandomToken = (length) => crypto
.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

// Rota POST /login com as validações de campos
app.post('/login', validateFields, (req, res) => {
  const token = generateRandomToken(16);
  res.status(HTTP_OK_STATUS).json({ token });
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (_req, res) => {
  const readTalkerFile = await readTalker();
  res.status(HTTP_OK_STATUS).send(readTalkerFile);
});

app.get('/talker/:id', async (req, res) => {
   // Obtem o ID fornecido na rota e converte para número inteiro
  const id = parseInt(req.params.id, 10);
  const rTalkerFile = await readTalker();
  // Busca a pessoa palestrante no array de talkers pelo ID
  const talker = rTalkerFile.find((t) => t.id === id);

  if (talker) {
    res.status(200).json(talker);
  } else {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
});
