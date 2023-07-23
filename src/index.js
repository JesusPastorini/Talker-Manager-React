const express = require('express');
const { readTalker } = require('./utils/readTalker');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar 
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
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
