const express = require('express');
const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

const loginRouter = require('./routers/loginRouter');
const talkerRouter = require('./routers/talkerRouter');

app.use(loginRouter);
app.use(talkerRouter);

// não remova esse endpoint, e para o avaliador funcionar 
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});
 
app.listen(PORT, () => {
  console.log('Online');
});
