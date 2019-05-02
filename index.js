const robots = {
  input: require('./robots/inputRobot'),
  text: require('./robots/textRobot'),
  image: require('./robots/imageRobot'),
  state: require('./robots/stateRobot')
};

async function start() {
  robots.input();

  await robots.text();

  await robots.image();

  // const content = robots.state.load();
  // console.dir(content, { depth: null });
}

start();