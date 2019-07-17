const Discord = require('discord.js');
const Utils   = require('./utils.js');
const Config  = require('./cfg.json');

const Bot = new Discord.Client();

Bot.on('ready', (msg) => {
    console.log('Ready!');
    Bot.user.setActivity(`${Config.prefix}help`);
});

Bot.on('message', (msg) => {
    if(!msg.author.bot)
        Utils.HandleMessage(msg);
});

Bot.on('guildMemberAdd', (member) => {
    member.guild.defaultChannel.send(`siema @${member.username}`);
});

Bot.on('guildBanAdd', (guild, user) => {
    guild.defaultChannel.send(`PepeLaugh :point_right: ${user.username}`);
});

Bot.login(Config.token);