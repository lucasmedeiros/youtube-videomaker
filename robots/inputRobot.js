const readline = require('readline-sync');
const stateRobot = require('./stateRobot');

function start() {
  const contentObject = {
    maximumSentences: 7
  };

  contentObject.searchTerm = askAndReturnSearchTerm();
  contentObject.prefix = askAndReturnPrefix();
  stateRobot.save(contentObject);

  function askAndReturnSearchTerm() {
    question = readline.question("Digite o nome de um artigo da Wikipedia: ");
    return question;
  }

function askAndReturnPrefix() {
    prefixes = ['Quem é', 'O que é', 'A história de'];
    selectedPrefixIndex = readline.keyInSelect(prefixes);

    return prefixes[selectedPrefixIndex];
  }
}

module.exports = start;
