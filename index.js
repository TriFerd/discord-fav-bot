const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');
const { favMessage } = require('./fav-handler.js');

const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION'] });
client.commands = new Discord.Collection();

// register commands dynamically
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  // check if command is registered, else return
  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  if (command.guildOnly && message.channel.type !== 'text') {
    if (message.channel.type === 'dm') {
      return message.channel.send('I can\'t execute that command inside DMs!');
    }
    return message.channel.reply('I can\'t execute that command inside DMs!');
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide the necessary arguments, ${message.author}`;

    if (command.usage) {
      reply += `\nUsage: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 0) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    // execute command
    command.execute(client, message, args);
  } catch (error) {
    console.error(error);
    message.reply('error executing that command');
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  // if reaction is partial -> fetch
  if (reaction.partial) {
    // fetched message may be deleted
    try {
      await reaction.fetch();
    } catch (error) {
      console.log('Message which was reacted upon is deleted: ', error);
      return; // Return as `reaction.message.author` may be undefined/null
    }
  }
  // Now the message has been cached and is fully available
  await favMessage(reaction.message);
});

client.login(token);
