const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');

// Definir sua API key
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const watsonApiKey = require('../credentials/watson-nlu.json').apikey;

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

let nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

async function start(contentObject) {
    await fetchContentFromWikipedia(contentObject);
    cleanContent(contentObject);
    breakContentIntoSentences(contentObject);
    limitContentIntoMaximumSentences(contentObject);
    await fetchAllSentencesKeywords(contentObject);

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

    function breakContentIntoSentences(contentObject) {
        contentObject.sentences = []

        const sentences = sentenceBoundaryDetection
            .sentences(contentObject.cleanContent);
        
        sentences.forEach((sentence) => {
            contentObject.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            });
        });
    }

    function limitContentIntoMaximumSentences(contentObject) {
        contentObject.sentences = 
            contentObject.sentences.slice(0, contentObject.maximumSentences);
    }

    async function fetchAllSentencesKeywords(contentObject) {
        for (const sentence of contentObject.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features : {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error;
                }
    
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text;
                });
    
                resolve(keywords);
            });
        });
    }
}

module.exports = start;