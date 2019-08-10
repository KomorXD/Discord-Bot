const Discord = require('discord.js');
const Cfg     = require('./cfg.json');
const Msg     = require('./msgHandler');

// Create a bot instance
const Bot = new Discord.Client();

// Look for 'ready' event
Bot.on('ready', (message) => {
    console.log('Ready!');
    Bot.user.setActivity(`${Cfg.prefix}help`);
});

// React to someone's message
Bot.on('message', (message) => {
    if(!message.author.bot)
        Msg.HandleMessage(message);
});

// React when someone is added to a guild
Bot.on('guildMemberAdd', (member) => {
    member.guild.defaultChannel.send(`Hello @${member.username}`);
});

// React when someone is banned from a guild
Bot.on('guildBanAdd', (guild, user) => {
    guild.defaultChannel.send(`@${user.username} b gone`);
});

// Login with OAuth token
Bot.login(Cfg.token);