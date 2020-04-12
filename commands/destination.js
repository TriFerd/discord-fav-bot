const { getKeyvForGuild } = require('../database.js');

module.exports = {
  name: 'destination',
  description: 'Sets the current channel as the destination channel for posting favorites. Each server has its own destination channel.',
  execute (client, message, args) {
    // abort if channel is not discord text channel
    if (message.channel.type !== 'text') {
      message.channel.send('Only server text channels are allowed as destination.');
      return;
    }
    const guildId = message.guild.id;
    const keyv = getKeyvForGuild(guildId);
    keyv.set('dest', message.channel.id).then(result => {
      message.channel.send(`Destination set to \`${message.channel.name}\`.`);
    });
  }
};
