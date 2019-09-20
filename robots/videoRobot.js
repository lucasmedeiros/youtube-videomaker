const os = require('os');
const fs = require('fs');
const exec = require('child_process').exec;
const xml2js = require('xml2js');
const stateRobot = require('./stateRobot');

const HOME_DIR = os.homedir();
const TEMPLATES_DIR = 'templates';
const DEFAULT_TEMPLATE_DIR = `${TEMPLATES_DIR}/default`;
const SCRIPT_PATH = `${DEFAULT_TEMPLATE_DIR}/render-video.sh`;

const start = async (dirName) => {

  const getContentFromKdenliveXML = async (fileName) => {
    return new Promise((resolve, reject) => {
      const filePath = `${DEFAULT_TEMPLATE_DIR}/${fileName}`;
      fs.readFile(filePath, (err, data) => {
        if (err)
          reject(new Error(`Arquivo ${dirName}/${filePath} não encontrado.`));
    
        xml2js.parseString(data, (err2, result) => {
          if (err2) 
            reject(new Error(`Não foi possível converter o conteúdo do arquivo ${dirName}/${filePath}.`));
    
          resolve(result);
        });
      });
    });
  }

  const createKdenliveXMLFile = async (kdenliveXMLContentJSON) => {
    console.log("> [renderização] Criando arquivo XML de renderização...");
    return new Promise((resolve, reject) => {
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(kdenliveXMLContentJSON);

      fs.writeFile(`${dirName}/${DEFAULT_TEMPLATE_DIR}/render-video.sh.mlt`, xml, (err, data) => {
        if (err) reject(new Error(`Não foi possível criar o arquivo de renderização: ${err}`));

        console.log("> [renderização] Arquivo XML de renderização criado com sucesso!");
        resolve();
      });
    });
  }

  const genericProducerFilter = (producer, property) => {
    return producer.property[2]._ === property;
  }

  const producerFilter = (producer) => {
    return genericProducerFilter(producer, 'CONVERTED-IMAGE');
  }

  const sentenceFilter = (producer) => {
    return genericProducerFilter(producer, 'SENTENCE');
  }

  const audioFilter = (producer) => {
    return genericProducerFilter(producer, 'AUDIO');
  }

  const prepareKdenliveXML = async () => {
    return new Promise(async (resolve, reject) => {
      const kdenliveXMLContent = await getContentFromKdenliveXML('render-video.sh.mlt').catch(async _err => {
        const kdenliveXMLOriginalContent = await getContentFromKdenliveXML('render-video-original.sh.mlt')
          .catch(err => {
            reject(new Error(`Não foi possível obter conteúdo do XML original: ${err.message}`));
          });
        
        const resourceDir = `${dirName}/resources`;
        
        kdenliveXMLOriginalContent.mlt.$.root = HOME_DIR;

        let producers = kdenliveXMLOriginalContent.mlt.producer;
        let imageProducers = producers.filter(producerFilter);
        let sentenceProducers = producers.filter(sentenceFilter);
        let audioProducers = producers.filter(audioFilter);

        imageProducers.forEach((element, index) => {
          element.property[2]._ = `${resourceDir}/${index}-converted.png`;
        });

        sentenceProducers.forEach((element, index) => {
          element.property[2]._ = `${resourceDir}/${index}-sentence.png`;
        });

        audioProducers.forEach((element) => {
          element.property[2]._ = `${dirName}/${DEFAULT_TEMPLATE_DIR}/track-1.mp3`;
        });
        
        await createKdenliveXMLFile(kdenliveXMLOriginalContent);
        resolve(kdenliveXMLOriginalContent);
      });

      resolve(kdenliveXMLContent);
    });
  }

  const renderVideoWithKdenlive = async (contentObject) => {
    return new Promise((resolve, reject) => {
      console.log("> [renderização] Vídeo sendo renderizado...");
      exec(`./${SCRIPT_PATH} '${contentObject.prefix} ${contentObject.searchTerm}'`, (error, _stdout, _stderr) => {
        if (error) reject(error);

        console.log('> [renderização] Vídeo renderizado com sucesso: ');
        resolve();
      });
    });
  }

  const contentObject = stateRobot.load();
  console.log('> [renderização] Preparando arquivo XML do Kdenlive.');
  await prepareKdenliveXML().catch(err => {
    throw new Error(err);
  });
  await renderVideoWithKdenlive(contentObject);
}

module.exports = start;
