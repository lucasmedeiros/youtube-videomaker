const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');

// Definir sua API key
const { algorithmiaCredentials, watsonCredentials } = require('../credentials');

const algorithmiaApiKey = algorithmiaCredentials.apiKey;
const watsonApiKey = watsonCredentials.apikey;

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const stateRobot = require('./stateRobot');

const start = async () => {
  const fetchContentFromWikipedia = async (contentObject) => {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300');
    
    const wikipediaResponse = await wikipediaAlgorithm.pipe({
      "articleName": contentObject.searchTerm,
      "lang": "pt"
    });

    const wikipediaContent = wikipediaResponse.get();
    
    contentObject.sourceContentOriginal = wikipediaContent.content;
  }

  const cleanContent = (contentObject) => {
    const removeBlanksAndMarkdowns = (text) => {
      const allLines = text.split('\n');

      const withoutBlanksAndMarkdowns = allLines.filter((line) => {
        return (line.trim().length === 0 || !line.trim().startsWith('='));
      });

      return withoutBlanksAndMarkdowns.join(' ');
    }

    const withoutBlanksAndMarkdowns = removeBlanksAndMarkdowns(contentObject.sourceContentOriginal);
    contentObject.cleanContent = withoutBlanksAndMarkdowns;
  }

  const breakContentIntoSentences = (contentObject) => {
    contentObject.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(contentObject.cleanContent);
    
    sentences.forEach((sentence) => {
      contentObject.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      });
    });
  }

  const limitContentIntoMaximumSentences = (contentObject) => {
      contentObject.sentences = contentObject.sentences.slice(0, contentObject.maximumSentences);
  }

  const fetchAllSentencesKeywords = async (contentObject) => {
      for (const sentence of contentObject.sentences) {
        sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
      }
  }

  const fetchWatsonAndReturnKeywords = async (sentence) => {
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

  const contentObject = stateRobot.load();

  console.log("> Obtendo resultados textuais...");
  await fetchContentFromWikipedia(contentObject);
  cleanContent(contentObject);
  breakContentIntoSentences(contentObject);
  limitContentIntoMaximumSentences(contentObject);
  await fetchAllSentencesKeywords(contentObject);

  stateRobot.save(contentObject);
}

module.exports = start;