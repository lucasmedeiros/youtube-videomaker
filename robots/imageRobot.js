const google = require('googleapis').google;
const customSearch = google.customsearch('v1');

const stateRobot = require('./stateRobot');
const { googleSearchCredentials } = require('../credentials');

start = async () => {
  findImagesOnGoogle = async (query) => {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineID,
      q: query,
      searchType: 'image',
      imgSize: 'huge',
      num: 2
    });

    const imagesUrl = response.data.items.map((item) => {
      return item.link;
    });

    return imagesUrl;
  }

  findImagesFromAllSentences = async (contentObject) => {
    for (sentence of contentObject.sentences) {
      const query = `${contentObject.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await findImagesOnGoogle(query);

      sentence.googleSearchQuery = query;
    }
  }

  const contentObject = stateRobot.load();

  await findImagesFromAllSentences(contentObject);
  stateRobot.save(contentObject);
}

module.exports = start;