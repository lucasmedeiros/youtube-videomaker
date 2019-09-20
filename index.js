const exec = require('child_process').exec;

const robots = {
  input: require('./robots/inputRobot'),
  text: require('./robots/textRobot'),
  image: require('./robots/imageRobot'),
  video: require('./robots/videoRobot'),
  youtube: require('./robots/youtubeRobot'),
};

async function start() {

  const stopExecution = (err) => {
    console.error(err.message);
    process.exit(1);
  }
  
  const checkProgramInstalled = async (programName, programAlias) => {
    return new Promise((resolve, reject) => {
      exec(`command -v ${programName}`, (err, stdout) => {
        if (err) reject(new Error(`${programAlias} não está instalado em sua máquina.`));

        resolve(stdout);
      });
    });
  }

  const checkEnvironment = async () => {
    return new Promise(async (resolve, reject) => {
      await checkProgramInstalled('kdenlive_render', 'Kdenlive').catch(err => {
        reject(new Error(`Ambiente não configurado corretamente: ${err.message}`));
      });

      await checkProgramInstalled('convert', 'ImageMagick').catch(err => {
        reject(new Error(`Ambiente não configurado corretamente: ${err.message}`));
      });

      resolve();
    });
  }

  await checkEnvironment().catch(stopExecution);
  robots.input();
  await robots.text().catch(stopExecution);
  await robots.image().catch(stopExecution);
  await robots.video(__dirname).catch(stopExecution);
  await robots.youtube(__dirname).catch(stopExecution);

  console.log("Feito!");
}

start();
