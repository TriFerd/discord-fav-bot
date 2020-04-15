// @ts-check
const { favReaction, checkedReaction } = require('../config.json');
const { getKeyvForGuild } = require('../database.js');

module.exports = {
  name: 'scan',
  description: 'Scans the channel the command was issued in for starred messages.',
  execute (client, message, args) {
    // abort if channel is not discord text channel
    if (message.channel.type !== 'text') {
      message.channel.send('This command is only availible for text channels.');
      return;
    }

    // prepare args
    const parameters = args.filter(arg => arg.startsWith('--')).map(arg => arg.substring(2));
    let doHardScan = false;
    if (parameters.includes('hard')) {
      doHardScan = true;
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

        // todo: add method for fetching more than 100 messages int othe function itself, otherwise the whole scan will proceed either way (even if scanning a already scanned message)

        message.channel.send('Scanning...');
        // fetch last messages
        getUnlimitedMessagesFromChannel(message.channel, limit || 1000).then(rawMessages => {
          const messageArray = [];
          for (const m of rawMessages) {
            // check for reactions
            const reactionCache = m.reactions.cache;
            if (reactionCache.has(checkedReaction) && !doHardScan) {
              break;
            } else if (reactionCache.has(favReaction) && !reactionCache.has(checkedReaction)) {
              // collect valid messages
              if (m.attachments.size) {
                const messageAttachmentUrl = m.attachments.values().next().value.url;
                messageArray.push({ content: m.content, attachmentUrl: messageAttachmentUrl });
              } else {
                messageArray.push({ content: m.content, attachmentUrl: '' });
              }
              m.react(checkedReaction);
            }
          }

          // send messages in reverse order of scanning
          messageArray.reverse();
          const promises = [];
          for (const el of messageArray) {
            if (el.attachmentUrl !== '') {
              // send attachment
              promises.push(destChannel.send(el.content, { files: [el.attachmentUrl] }));
            } else {
              if (el.content !== '') {
                promises.push(destChannel.send(el.content));
              }
            }
          }
          Promise.all(promises).then(x => {
            message.channel.send('Scanning done!');
          });
        });
      }).catch(console.error);
  }
};

async function getUnlimitedMessagesFromChannel (channel, limit) {
  const allMessages = [];
  let lastMessageId;

  while (true) {
    const options = { limit: 100 }; // discord only allows a limit of 100 at once
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const messages = await channel.messages.fetch(options);
    allMessages.push(...messages.array());
    lastMessageId = messages.last().id;

    if (messages.size !== 100 || allMessages >= limit) {
      break;
    }
  }

  return allMessages;
}
