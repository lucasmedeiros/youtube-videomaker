const readline = require('readline-sync');
const robots = {
    text: require('./robots/textRobot.js')
};

async function start() {
    const contentObject = {};

    contentObject.searchTerm = askAndReturnSearchTerm();
    contentObject.prefix = askAndReturnPrefix();

    await robots.text(contentObject);

    function askAndReturnSearchTerm() {
        question = readline.question("Digite o nome de um artigo da Wikipedia: ");

        return question;
    }

    function askAndReturnPrefix() {
        prefixes = ['Quem é', 'O que é', 'A história de'];
        selectedPrefixIndex = readline.keyInSelect(prefixes);

        return prefixes[selectedPrefixIndex];
    }

    console.log(contentObject);
}

start();