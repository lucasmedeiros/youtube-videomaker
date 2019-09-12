const robots = {
  input: require('./robots/inputRobot'),
  text: require('./robots/textRobot'),
  image: require('./robots/imageRobot'),
  state: require('./robots/stateRobot'),
  video: require('./robots/videoRobot')
};

async function start() {
  robots.input();
  await robots.text();
  await robots.image();
  await robots.video();

  console.log("Feito!");
}

start();