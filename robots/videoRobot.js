const os = require('os');
const fs = require('fs');
const exec = require('child_process').exec;
const parseString = require('xml2js').parseString;

const HOME = os.homedir();
const TEMPLATES_DIR = 'templates/';
const DEFAULT_TEMPLATE_DIR = `${TEMPLATES_DIR}default/`;
const SCRIPT_DIR = `${DEFAULT_TEMPLATE_DIR}script-render.sh`;

const start = async (dirName) => {
  const getContentFromKdenliveXML = async (fileName) => {
    return new Promise((resolve, reject) => {
      const filePath = `${DEFAULT_TEMPLATE_DIR}${fileName}`;
      fs.readFile(filePath, (err, data) => {
        if (err)
          reject(new Error(`Arquivo ${filePath} não encontrado!`));
    
        parseString(data, (err2, result) => {
          if (err2) 
            reject(new Error(`Não foi possível converter o conteúdo do arquivo ${filePath}`));
    
          resolve(result);
        });
      });
    });
  }

  const renderVideoWithKdenlive = async () => {
    return new Promise((resolve, reject) => {
      console.log("> [renderização] Vídeo sendo renderizado...");
      exec(`./${SCRIPT_DIR}`, (error, _stdout, _stderr) => {
        if (error) reject(error);

        console.log('> [renderização] Vídeo renderizado com sucesso: ');
        resolve();
      });
    });
  }

  console.log(dirName);
  const xmlContent = await getContentFromKdenliveXML('render-video-original.sh.mlt')
    .catch(err => {
      throw new Error(`Não foi possível obter conteúdo do XML: ${err.message}`);
    });
  
  xmlContent.mlt.$.root = HOME;
  xmlContent.mlt.producer.forEach((producer, index) => {
    console.log(index, producer.property[2]._);
  })
  // await renderVideoWithKdenlive();
}

module.exports = start;
