const { getKeyvForGuild } = require('./database.js');
const { favReaction, checkedReaction } = require('./config.json');

exports.favMessage = async (message) => {
  // init database for dest channel
  const guildId = message.guild.id;
  const keyv = getKeyvForGuild(guildId);
  const destChannelId = await keyv.get('dest');

  // check if dest channel is set
  if (destChannelId === undefined) {
    message.channel.send('Destination channel not set. Please set it first.');
    return;
  }
  const destChannel = message.client.channels.cache.get(destChannelId);

  const reactions = message.reactions.cache;
  if (reactions.has(favReaction) && !reactions.has(checkedReaction) && reactions.get(favReaction).count === 1) {
    // message is valid for handling
    // handle message and repost
    if (message.attachments.size) {
      const messageAttachmentUrl = message.attachments.values().next().value.url;
      await destChannel.send(message.content, { files: [messageAttachmentUrl] });
    } else {
      await destChannel.send(message.content);
    }
    message.react(checkedReaction);
  }
};
