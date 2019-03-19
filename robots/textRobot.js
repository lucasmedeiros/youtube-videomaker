const algorithmia = require('algorithmia');

// Definir sua API key
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;

async function start(contentObject) {
    await fetchContentFromWikipedia(contentObject);
    cleanContent(contentObject);
    // breakContentIntoSentences(contentObject);

    async function fetchContentFromWikipedia(contentObject) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated
            .algo('web/WikipediaParser/0.1.2?timeout=300');
        const wikipediaResponse = await wikipediaAlgorithm.pipe({
            "articleName": contentObject.searchTerm,
            "lang": "pt"
        });
        const wikipediaContent = wikipediaResponse.get();
        
        contentObject.sourceContentOriginal = wikipediaContent.content;
    }

    function cleanContent(contentObject) {
        const withoutBlanksAndMarkdowns = 
            removeBlanksAndMarkdowns(contentObject.sourceContentOriginal);
        
        contentObject.cleanContent = withoutBlanksAndMarkdowns;
        
        function removeBlanksAndMarkdowns(text) {
            const allLines = text.split('\n');

            const withoutBlanksAndMarkdowns = allLines.filter((line) => {
                return (line.trim().length === 0 || !line.trim().startsWith('='));
            });

            return withoutBlanksAndMarkdowns.join(' ');
        }


    }
}

module.exports = start;