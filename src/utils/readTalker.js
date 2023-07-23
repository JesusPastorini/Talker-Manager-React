const fs = require('fs').promises;
const path = require('path');

const readTalker = async () => {
  try {
    const data = await fs.readFile(path.resolve(__dirname, '../talker.json'), 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Erro ao ler o arquivo: ${err.message}`);
    throw err; // Adicionando um throw para propagar o erro para quem chama essa função.
  }
};

module.exports = {
  readTalker,
};
