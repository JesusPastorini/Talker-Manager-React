const fs = require('fs').promises;
const path = require('path');

const saveTalker = async (talkers) => {
  try {
    const data = JSON.stringify(talkers, null, 2);
    await fs.writeFile(path.resolve(__dirname, '../talker.json'), data, 'utf-8');
  } catch (err) {
    console.error(`Erro ao salvar o arquivo: ${err.message}`);
    throw err;
  }
};

module.exports = {
  saveTalker,
};
