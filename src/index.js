const express = require('express');
const crypto = require('crypto');
const { readTalker } = require('./utils/readTalker');
const { saveTalker } = require('./utils/saveTalker');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_CREATED_STATUS = 201;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_UNAUTHORIZED_STATUS = 401;
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

// Middleware para validar o token de autenticação
const validateToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  if (!authorization || authorization.length !== 16 || typeof authorization !== 'string') {
    return res.status(HTTP_UNAUTHORIZED_STATUS).json({ message: 'Token inválido' });
  }

  next();
};

const validaName = (name) => {
  if (!name) {
    throw new Error('O campo "name" é obrigatório');
  }

  if (name.length < 3) {
    throw new Error('O "name" deve ter pelo menos 3 caracteres');
  }
};

const validaAge = (age) => {
  if (!age) {
    throw new Error('O campo "age" é obrigatório');
  }

  if (Number.isNaN(age, 10) || !Number.isInteger(parseFloat(age, 10)) || parseInt(age, 10) < 18) {
    throw new Error('O campo "age" deve ser um número inteiro igual ou maior que 18');
  }
};

const validaTalk = (talk) => {
  if (!talk || typeof talk !== 'object') {
    throw new Error('O campo "talk" é obrigatório');
  }
};

const validaWatchedat = (talk) => {
  const { watchedAt } = talk;

  if (!watchedAt) {
    throw new Error('O campo "watchedAt" é obrigatório');
  }

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(watchedAt)) {
    throw new Error('O campo "watchedAt" deve ter o formato "dd/mm/aaaa"');
  }
};

const validateRateValue = (rate) => {
  const rateValue = parseFloat(rate);
  if (Number.isNaN(rateValue) || rateValue < 1 || rateValue > 5 || rateValue % 1 !== 0) {
    throw new Error('O campo "rate" deve ser um número inteiro entre 1 e 5');
  }
};
const validaRate = (talk) => {
  if (!Object.prototype.hasOwnProperty.call(talk, 'rate')) {
    throw new Error('O campo "rate" é obrigatório');
  }

  validateRateValue(talk.rate);
};

// Middleware para validar os campos do corpo da requisição
const validateFieldsTalk = (req, res, next) => {
  try {
    const { name, age, talk } = req.body;
    validaName(name);
    validaAge(age);
    validaTalk(talk);
    validaWatchedat(talk);
    validaRate(talk);
    
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

// Rota POST /talker com as validações de campos
app.post('/talker', validateToken, validateFieldsTalk, async (req, res) => {
  const { name, age, talk } = req.body;

  // Adicionar a nova pessoa palestrante ao arquivo JSON (assumindo que o arquivo é talker.json)
  const talkerFile = await readTalker();
  const newTalker = {
    id: talkerFile.length + 1,
    name,
    age: parseInt(age, 10),
    talk,
  };

  const talkerFileUpdate = [...talkerFile, newTalker];
  await saveTalker(talkerFileUpdate);

  res.status(HTTP_CREATED_STATUS).json(newTalker);
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
