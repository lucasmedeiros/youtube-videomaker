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
        prefixes = ['Who is', 'What is', 'The history of'];
        selectedPrefixIndex = readline.keyInSelect(prefixes);

        return prefixes[selectedPrefixIndex];
    }

    console.log(contentObject);
}

start();