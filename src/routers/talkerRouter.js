const express = require('express');

const { readTalker } = require('../utils/readTalker');
const { saveTalker } = require('../utils/saveTalker');
const { validateToken } = require('../utils/validateToken');

const router = express.Router();
const HTTP_CREATED_STATUS = 201;
const HTTP_BAD_REQUEST_STATUS = 400;

const HTTP_OK_STATUS = 200;

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

  // Rota POST /talker com as validações de campos
  router.post('/talker', validateToken, validateFieldsTalk, async (req, res) => {
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
  /// //////////
  // Rota PUT /talker/:id com as validações de campos
  router.put('/talker/:id', validateToken, validateFieldsTalk, async (req, res) => {
    const { id } = req.params;
    const { name, age, talk } = req.body;
    const talkerId = parseInt(id, 10);
    // Ler os dados atuais do arquivo JSON
    const talkerFile = await readTalker();
    // Encontrar a pessoa palestrante pelo ID
    const talkerToUpdate = talkerFile.find((t) => t.id === talkerId);
  
    if (!talkerToUpdate) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    // Atualizar os campos da pessoa palestrante
    talkerToUpdate.name = name;
    talkerToUpdate.age = parseInt(age, 10);
    talkerToUpdate.talk = talk;
    // Salvar as alterações no arquivo JSON
    await saveTalker(talkerFile);
    res.status(HTTP_OK_STATUS).json(talkerToUpdate);
  });
  /// ///////
  
  // Rota DELETE /talker/:id com as validações de token
  router.delete('/talker/:id', validateToken, async (req, res) => {
    const { id } = req.params;
    const talkerId = parseInt(id, 10);
    const talkerFile = await readTalker();
  
    // Verificar se a pessoa palestrante com o ID fornecido existe
    const talkerIndex = talkerFile.findIndex((t) => t.id === talkerId);
  
    if (talkerIndex === -1) {
      return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    }
    // Remover a pessoa palestrante do array
    talkerFile.splice(talkerIndex, 1);
  
    // Salvar as alterações no arquivo JSON
    await saveTalker(talkerFile);
  
    res.status(204).send();
  });
  
  router.get('/talker', async (_req, res) => {
    const readTalkerFile = await readTalker();
    res.status(HTTP_OK_STATUS).send(readTalkerFile);
  });
  
  router.get('/talker/:id', async (req, res) => {
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

  module.exports = router;