module.exports = {
  name: 'scuff',
  description: 'When the bot is scuffed, feel free to execute this command.',
  execute (client, message, args) {
    const fire = '🔥🔥🔥🔥🔥🔥\n🔥🔥🔥🔥🔥🔥\n🔥🔥😐☕🔥🔥\n🔥🔥🔥🔥🔥🔥\n🔥🔥🔥🔥🔥🔥\n';
    message.channel.send(fire);
  }
};
