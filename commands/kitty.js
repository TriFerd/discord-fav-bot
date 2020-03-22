const fs = require('fs');
const _ = require('lodash');
const path = require('path');

module.exports = {
  name: 'kitty',
  description: 'Displays an image of a cat. ',
  execute (message, args) {
    if (!message.channel.nsfw) {
      const imagePaths = fs.readdirSync('kitties', { withFileTypes: true }).map((dirent) => dirent.name);
      const rnd = _.random(0, imagePaths.length - 1);
      const pathToRandomFile = path.join('kitties', imagePaths[rnd]);
      message.channel.send(`Meow~~ (${rnd + 1}/${imagePaths.length})`, { files: [pathToRandomFile] });
    } else {
      message.channel.send('This channel is too cruel for kitties :(');
    }
  }
};
