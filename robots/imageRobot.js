const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

const customSearch = google.customsearch('v1');

const stateRobot = require('./stateRobot');
const { googleSearchCredentials } = require('../credentials');

const resourcesDirectoryPath = './resources';

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

  const downloadImage = async (imageUrl, fileName) => {
    return await imageDownloader.image({
      url: imageUrl, url: imageUrl, dest: `${resourcesDirectoryPath}/${fileName}`,
    });
  }

  const checkImageExists = (url, contentObject) => {
    if (contentObject.downloadedImages.includes(url))
      throw new Error("Imagem já foi baixada, tentando próxima...");
  };

  const createDirectory = () => {
    if (!fs.existsSync(resourcesDirectoryPath)) {
      fs.mkdirSync(resourcesDirectoryPath);
    }
  }

  const downloadAllImages = async (contentObject) => {
    contentObject.downloadedImages = [];
    for (let i = 0; i < contentObject.sentences.length; i++) {
      const images = contentObject.sentences[i].images;

      for (let j = 0; j < images.length; j++) {
        const imageUrl = images[j];

        try {
          checkImageExists(imageUrl, contentObject);
          createDirectory();

          await downloadImage(imageUrl, `${i}-original.png`);

          console.log(`> Baixou imagem com sucesso: ${imageUrl}`);
          contentObject.downloadedImages.push(imageUrl);

          break;
        } catch(error) {
          console.log(`> Erro ao baixar ${imageUrl}: ${error}`);
        }
      }
    }
  }

  const convertImage = async (sentenceIndex) => {
    return new Promise((resolve, reject) => {
      const inputFile = `${resourcesDirectoryPath}/${sentenceIndex}-original.png`;
      console.log(inputFile);
      const outputFile = `${resourcesDirectoryPath}/${sentenceIndex}-converted.png`;
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputFile)
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-blur', '0x9')
          .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> Image converted: ${outputFile}`);
          resolve();
        })
    });
  }

  const convertAllImages = async (contentObject) => {
    for (let i = 0; i < contentObject.sentences.length; i++) {
      await convertImage(i);
    }
  }

  const contentObject = stateRobot.load();

  console.log("> Obtendo imagens...");
  await findImagesFromAllSentences(contentObject);
  console.log("> Baixando imagens...");
  await downloadAllImages(contentObject);
  console.log("> Convertendo imagens...");
  await convertAllImages(contentObject);

  stateRobot.save(contentObject);
}

module.exports = start;