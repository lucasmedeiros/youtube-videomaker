const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const fs = require('fs');

const customSearch = google.customsearch('v1');

const stateRobot = require('./stateRobot');
const { googleSearchCredentials } = require('../credentials');

const start = async () => {
  const findImagesOnGoogle = async (query) => {
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

  const findImagesFromAllSentences = async (contentObject) => {
    for (sentence of contentObject.sentences) {
      const query = `${contentObject.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await findImagesOnGoogle(query);

      sentence.googleSearchQuery = query;
    }
  }

  const downloadImage = async (imageUrl, resourcesDirectory, fileName) => {
    return await imageDownloader.image({
      url: imageUrl, url: imageUrl, dest: `${resourcesDirectory}/${fileName}`,
    });
  }

  const checkImageExists = (url, contentObject) => {
    if (contentObject.downloadedImages.includes(url))
      throw new Error("Imagem já foi baixada, tentando próxima...");
  };

  const createDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }

  const downloadAllImages = async (contentObject) => {
    contentObject.downloadedImages = [];
    for (let i = 0; i < contentObject.sentences.length; i++) {
      const images = contentObject.sentences[i].images;

      for (let j = 0; j < images.length; j++) {
        const imageUrl = images[j];

        try {
          const resourcesDirectoryPath = './resources';
          checkImageExists(imageUrl, contentObject);
          createDirectory(resourcesDirectoryPath);
          await downloadImage(imageUrl, resourcesDirectoryPath, `${i}-original.png`);
          console.log(`> Baixou imagem com sucesso: ${imageUrl}`);
          contentObject.downloadedImages.push(imageUrl);
          break;
        } catch(error) {
          console.log(`> Erro ao baixar ${imageUrl}: ${error}`);
        }
      }
    }
  }

  const contentObject = stateRobot.load();

  console.log("> Obtendo imagens...");
  await findImagesFromAllSentences(contentObject);
  console.log("> Baixando imagens...");
  await downloadAllImages(contentObject);

  stateRobot.save(contentObject);
}

module.exports = start;