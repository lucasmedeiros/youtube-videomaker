const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});
const stateRobot = require('./stateRobot');
const { googleCredentials } = require('../credentials');

const customSearch = google.customsearch('v1');
const resourcesDirectoryPath = './resources';

const start = async () => {
  const findImagesOnGoogle = async (query) => {
    const response = await customSearch.cse.list({
      auth: googleCredentials.apiKey,
      cx: googleCredentials.searchEngineID,
      q: query,
      searchType: 'image',
      imgSize: 'huge',
      num: 2
    });

    const imagesUrl = response.data.items.map((item) => {
      return item.link;
    });

    return imagesUrl;
  };

  const findImagesFromAllSentences = async (contentObject) => {
    for (sentence of contentObject.sentences) {
      const query = `${contentObject.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await findImagesOnGoogle(query);

      sentence.googleSearchQuery = query;
    }
  };

  const downloadImage = async (imageUrl, fileName) => {
    return await imageDownloader.image({
      url: imageUrl, url: imageUrl, dest: `${resourcesDirectoryPath}/${fileName}`,
    });
  };

  const checkImageExists = (url, contentObject) => {
    if (contentObject.downloadedImages.includes(url))
      throw new Error("> [download de imagens] Imagem já foi baixada, tentando próxima...");
  };

  const createDirectory = () => {
    if (!fs.existsSync(resourcesDirectoryPath)) {
      fs.mkdirSync(resourcesDirectoryPath);
    }
  };

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

          console.log(`> [download de imagens] Baixou imagem com sucesso: ${imageUrl}`);
          contentObject.downloadedImages.push(imageUrl);

          break;
        } catch(error) {
          console.log(`> [download de imagens] Erro ao baixar ${imageUrl}: ${error}`);
        }
      }
    }
  };

  const convertImage = async (sentenceIndex) => {
    return new Promise((resolve, reject) => {
      const inputFile = `${resourcesDirectoryPath}/${sentenceIndex}-original.png`;
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

          console.log(`> [conversão de imagens] Imagem convertida: ${outputFile}`);
          resolve();
        })
    });
  };

  const convertAllImages = async (contentObject) => {
    for (let i = 0; i < contentObject.sentences.length; i++) {
      await convertImage(i);
    }
  };

  const createSentenceImage = async (sentenceIndex, sentenceText) => {
    return new Promise((resolve, reject) => {
      const outputFile = `${resourcesDirectoryPath}/${sentenceIndex}-sentence.png`;

      // const templateSettings = {
      //   0: {
      //     size: '1920x400',
      //     gravity: 'center'
      //   },
      //   1: {
      //     size: '1920x1080',
      //     gravity: 'center'
      //   },
      //   2: {
      //     size: '800x1080',
      //     gravity: 'west'
      //   },
      //   3: {
      //     size: '1920x400',
      //     gravity: 'center'
      //   },
      //   4: {
      //     size: '1920x1080',
      //     gravity: 'center'
      //   },
      //   5: {
      //     size: '800x1080',
      //     gravity: 'west'
      //   },
      //   6: {
      //     size: '1920x400',
      //     gravity: 'center'
      //   },
      // };

      gm()
        .out('-size', '1920x400')
        .out('-gravity', 'center')
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-font', 'Fira-Code-Bold')
        .out('-kerning', '-1')
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [criação de sentenças] Sentença criada: ${outputFile}`);
          resolve();
        })
    });
  };

  const createAllSentences = async (contentObject) => {
    for (let i = 0; i < contentObject.sentences.length; i++) {
      await createSentenceImage(i, contentObject.sentences[i].text);
    }
  };

  const createYouTubeThumbnail = async () => {
    return new Promise((resolve, reject) => {
      gm()
        .in(`${resourcesDirectoryPath}/0-converted.png`)
        .write(`${resourcesDirectoryPath}/youtube-thumbnail.jpg`, error => {
          if (error)
            return reject(error)
          
          console.log('> [criação de thumbnail] Thumbnail criada!');
          resolve();
        })
    });
  };

  const contentObject = stateRobot.load();

  console.log("> Obtendo imagens...");
  await findImagesFromAllSentences(contentObject);
  console.log("> Baixando imagens...");
  await downloadAllImages(contentObject);
  console.log("> Convertendo imagens...");
  await convertAllImages(contentObject);
  console.log("> Criando sentenças...");
  await createAllSentences(contentObject);
  console.log("> Criando thumbnail para o vídeo...");
  await createYouTubeThumbnail();

  stateRobot.save(contentObject);
}

module.exports = start;
