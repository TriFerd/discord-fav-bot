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

        // fetch last 100 messages
        message.channel.messages.fetch({ limit: 100 })
          .then(messages => {
            const messageArray = [];
            for (const [, m] of messages) {
              // check for reactions
              const reactionCache = m.reactions.cache;
              if (reactionCache.has(checkedReaction)) {
                break;
              } else if (reactionCache.has(favReaction)) {
                // collect valid messages
                if (m.attachments.size) {
                  const messageAttachmentUrl = m.attachments.values().next().value.url;
                  messageArray.push({ content: m.content, attachmentUrl: messageAttachmentUrl });
                } else {
                  messageArray.push({ content: m.content, imageUrl: '' });
                }
                m.react(checkedReaction);
              }
            }

            // send messages in reverse order of scanning
            messageArray.reverse();
            for (const el of messageArray) {
              if (el.attachmentUrl !== '') {
                // send attachment
                destChannel.send(el.content, { files: [el.attachmentUrl] });
              } else {
                if (el.content !== '') {
                  destChannel.send(el.content);
                }
              }
            }
          }).catch(console.error);
      });
  }
};
