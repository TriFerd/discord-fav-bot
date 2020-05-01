const { getKeyvForGuild } = require('../database.js');
const { favReaction } = require('../config.json');

module.exports = {
  name: 'autoscan',
  description: `Shows the current mode of the autoscan feature. Autoscan scans messages as soon as they receive a \`${favReaction}\`. Also used for enabling and disabling the autoscan feature.`,
  usage: '[--enable | --disable]',
  parameters: {
    '--enable': 'Enabels the autoscan feature.',
    '--disable': 'Disables the autoscan feature.'
  },
  async execute (client, message, args) {
    // abort if channel is not discord text channel
    if (message.channel.type !== 'text') {
      message.channel.send('This command is only availible for text channels.');
      return;
    }
    // prepare args
    const parameters = args.filter(arg => arg.startsWith('--')).map(arg => arg.substring(2));
    if (parameters.size > 1) {
      message.channel.send('Please provide a maximum of 1 mode parameters.');
      return;
    }

    // init database
    const guildId = message.guild.id;
    const keyv = getKeyvForGuild(guildId);
    let currAutoscanMode = await keyv.get('autoscan');

    if (currAutoscanMode === undefined) {
      currAutoscanMode = true;
      keyv.set('autoscan', currAutoscanMode);
    }

    let newAutoscanMode;
    if (parameters.length === 0) {
      await message.channel.send(`Autoscan: \`${currAutoscanMode ? 'enabled' : 'disabled'}\``);
      return;
    } else {
      if (parameters[0] === 'enable') {
        newAutoscanMode = true;
      } else if (parameters[0] === 'disable') {
        newAutoscanMode = false;
      } else {
        message.channel.send('Invalid mode parameter.');
        return;
      }
    }
    await keyv.set('autoscan', newAutoscanMode);
    await message.channel.send(`Autoscan: \`${newAutoscanMode ? 'enabled' : 'disabled'}\``);
  }
};
