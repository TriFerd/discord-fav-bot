const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const remoteKitties = require('../remote-kitties');

module.exports = {
  name: 'kitty',
  description: 'Displays an image of a cat. ',
  usage: '[remote]',
  execute (message, args) {
    if (!message.channel.nsfw) {
      if (args.length && args[0] === 'remote') {
        const rnd = _.random(0, remoteKitties.urls.length - 1);
        message.channel.send(`(_from a distance_) Meow~~ (${rnd + 1}/${remoteKitties.urls.length})`, { files: [remoteKitties.urls[rnd]] });
      } else {
        const imagePaths = fs.readdirSync('kitties', { withFileTypes: true }).map((dirent) => dirent.name);
        const rnd = _.random(0, imagePaths.length - 1);
        const pathToRandomFile = path.join('kitties', imagePaths[rnd]);
        message.channel.send(`Meow~~ (${rnd + 1}/${imagePaths.length})`, { files: [pathToRandomFile] });
      }
    } else {
      message.channel.send('This channel is too cruel for kitties :(');
    }
  }
};
