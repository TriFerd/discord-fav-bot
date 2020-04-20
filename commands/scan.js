// @ts-check
const { favReaction, checkedReaction } = require('../config.json');
const { getKeyvForGuild } = require('../database.js');

module.exports = {
  name: 'scan',
  description: 'Scans the current channel for messages marked with `⭐` (`:star:`) and reposts them in the designated destination-channel. Stops scanning at the first `✅` (`:white_check_mark:`) it encounters. Does not repost already posted messages.',
  usage: '[--no-stop | --rescan] [<limit>]',
  parameters: {
    '--no-stop': 'Does not stop scanning at the first `✅`',
    '--rescan': 'Does not stop at the first `✅`, does report already posted messages.'
  },
  execute (client, message, args) {
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

    let scanMode;
    if (parameters.length === 0) {
      scanMode = 'default';
    } else {
      if (!['no-stop', 'rescan'].includes(parameters[0])) {
        message.channel.send('Invalid mode parameter.');
        return;
      }
      scanMode = parameters[0];
    }

    const limit = args.map(arg => parseInt(arg)).filter(arg => !isNaN(arg))[0];

    // init database for dest channel
    const guildId = message.guild.id;
    const keyv = getKeyvForGuild(guildId);
    keyv.get('dest').then(
      destChannelId => {
        // check if dest channel is set
        if (destChannelId === undefined) {
          message.channel.send('Destination channel not set. Please set it first.');
          return;
        }
        const destChannel = client.channels.cache.get(destChannelId);

        message.channel.send(`Scanning... (mode: \`${scanMode}\`)`).then(_ => {
          getAndHandleMessages(message.channel, destChannel, limit || 1000, scanMode).then(count => {
            message.channel.send(`Scanning complete (${count} processed).`);
          });
        });
      }).catch(console.error);
  }
};

async function getAndHandleMessages (channel, destChannel, limit, scanMode) {
  const messagesToHandle = []; // orderer by date, desc
  let lastMessageId;
  let reachedEnd;

  while (true) {
    const options = { limit: 100 }; // discord only allows a limit of 100 at once
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const messages = Array.from((await channel.messages.fetch(options)).entries());
    for (const [i, [_, m]] of messages.entries()) {
      if (i > limit) {
        reachedEnd = true;
        break;
      }
      const reactions = m.reactions.cache;
      switch (scanMode) {
        case 'no-stop':
          if (reactions.has(favReaction) && !reactions.has(checkedReaction)) {
            messagesToHandle.push(m);
          }
          break;
        case 'rescan':
          if (reactions.has(favReaction)) {
            messagesToHandle.push(m);
          }
          break;
        case 'default':
          if (reactions.has(checkedReaction)) {
            reachedEnd = true;
          } else if (reactions.has(favReaction)) {
            messagesToHandle.push(m);
          }
          break;
      }
    }
    if (reachedEnd) {
      break;
    }
    lastMessageId = messages[messages.length - 1].id;

    if (messages.length !== 100) {
      break;
    }
    limit -= 100;
  }

  // fetched all messages to handle
  messagesToHandle.reverse();
  for (const m of messagesToHandle) {
    if (m.attachments.size) {
      const messageAttachmentUrl = m.attachments.values().next().value.url;
      await destChannel.send(m.content, { files: [messageAttachmentUrl] });
    } else {
      await destChannel.send(m.content);
    }
    m.react(checkedReaction);
  }
  return messagesToHandle.length;
}
