const express = require('express');
const crypto = require('crypto');

const router = express.Router();
const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;

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
router.post('/login', validateFields, (req, res) => {
    const token = generateRandomToken(16);
    res.status(HTTP_OK_STATUS).json({ token });
  });

  module.exports = router;
