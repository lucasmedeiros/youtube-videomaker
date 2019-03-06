const readline = require('readline-sync');

function start() {
    const contentObject = {};

    contentObject.searchTerm = askAndReturnSearchTerm();
    contentObject.prefix = askAndReturnPrefix();

    function askAndReturnSearchTerm() {
        question = readline.question("Type a Wikipedia search term: ");

        return question;
    }

    function askAndReturnPrefix() {
        prefixes = ['O que é', 'Quem é', 'A história de'];
        selectedPrefixIndex = readline.keyInSelect(prefixes);

        return prefixes[selectedPrefixIndex];
    }

    console.log(contentObject);
}

start();