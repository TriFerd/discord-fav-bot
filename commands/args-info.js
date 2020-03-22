module.exports = {
  name: 'args-info',
  description: 'Shows information about the given args.',
  args: true,
  usage: '<arg1> <arg2> ...',
  execute (message, args) {
    if (args[0] === 'foo') {
      return message.channel.send('bar');
    }

    message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
  }
};
