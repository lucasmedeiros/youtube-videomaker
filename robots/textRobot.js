const algorithmia = require('algorithmia');

// Definir sua API key
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;

function start(contentObject) {
    fetchContentFromWikipedia(contentObject);
    // cleanContent(contentObject);
    // breakContentIntoSentences(contentObject);

    async function fetchContentFromWikipedia(contentObject) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated
            .algo('web/WikipediaParser/0.1.2?timeout=300');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(contentObject.searchTerm);
        const wikipediaContent = wikipediaResponse.get();

        console.log(wikipediaContent);
    }
}

module.exports = start;