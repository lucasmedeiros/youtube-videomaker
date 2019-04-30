const robots = {
  input: require('./robots/inputRobot'),
  text: require('./robots/textRobot'),
  state: require('./robots/stateRobot')
};

async function start() {
  robots.input();
  await robots.text();

  const content = robots.state.load();
  console.dir(content, { depth: null });
}

start();