module.exports = {
  name: 'at',
  description: 'Mentions the mentioned user. lul',
  execute (message, args) {
    if (!message.mentions.users.size) {
      message.reply('Please mention a user.');
    } else {
      const user = message.mentions.users.first();
      message.channel.send(`<@${user.id}> sup dude?`);
    }
  }
};
