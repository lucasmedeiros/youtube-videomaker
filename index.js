const robots = {
  input: require('./robots/inputRobot'),
  text: require('./robots/textRobot'),
  image: require('./robots/imageRobot'),
  state: require('./robots/stateRobot')
};

async function start() {
  robots.input();

  console.log("Obtendo resultados textuais...");
  await robots.text();

  console.log("Obtendo imagens...");
  await robots.image();

  const content = robots.state.load();
  console.dir(content, { depth: null });
}

start();