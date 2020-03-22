module.exports = {
  name: 'server',
  description: 'Prints the current server\'s name',
  guildOnly: true,
  execute (message, args) {
    message.channel.send(`This server's name is: ${message.guild.name}`);
  }
};
