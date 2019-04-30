const fs = require('fs');
const contentFilePath = './content.json';

save = (content) => {
  const contentString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, contentString);
}

load = () => {
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8');
  const contentJSON = JSON.parse(fileBuffer);

  return contentJSON;
}

module.exports = {
  save, 
  load
}