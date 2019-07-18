const Config = require('./cfg.json');
const Music  = require('./music.js');

exports.HandleMessage = (msg) => {
    let prefix = Config.prefix;

    if(msg.content === `${prefix}help`)
        PrintHelp(msg, prefix);

    else if(msg.content.startsWith(`${prefix}play`))
        Music.PlaySong(msg);
    
    else if(msg.content === `${prefix}skip`)
        Music.Skip(msg);

    else if(msg.content === `${prefix}stop`)
        Music.Stop(msg);

    else if(msg.content === `${prefix}queue`)
        Music.Queue(msg);
    
    else if(msg.content.startsWith(`${prefix}remove`))
        Music.Remove(msg);
    
    else if(msg.content.startsWith(`${prefix}move`))
        Music.Move(msg);
    
    else if(msg.content === `${prefix}np`)
        Music.NowPlaying(msg);
    
    else if(msg.content === `${prefix}pause`)
        Music.Pause(msg);

    else if(msg.content === `${prefix}resume`)
        Music.Resume(msg);

    else if(msg.content === `${prefix}msgs`)
        Ranks.ShowRankingsByMessages(msg);
    
    else if(msg.content.toLowerCase().includes('nigger'))
        msg.channel.send(':cmonbruh:');

    else if(msg.content.toLowerCase().includes('ayaya'))
        msg.channel.send(':AYAYA:');
    
    else if(msg.content.toLowerCase().includes('jd'))
        msg.channel.send('JD');
}

exports.FormatTime = (seconds, ms = false) => {
    if(ms)
        seconds = parseInt(seconds / 1000);
    
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    let hours = Math.floor(minutes / 60);
    minutes -= hours * 60;

    let response = "";

    if(hours > 0) {
        if(hours < 10)
            response += `0${hours}:`;
        else
            response += `${hours}:`;
    }

    if(minutes < 10)
        minutes = `0${minutes}`;
    
    if(seconds < 10)
        seconds = `0${seconds}`;

    return `${response}${minutes}:${seconds}`;
}

const PrintHelp = (msg, prefix) => {
    msg.channel.send(`**${prefix}help** - ta strona xd
**${prefix}play [link / słowa kluczowe]** - gra muze
**${prefix}skip** - skipuje muze
**${prefix}stop** - wypierdala bota
**${prefix}queue** - kolejka piosenek
**${prefix}remove [pozycja]** - usuwa pozycję, jeśli istnieje (-1 usuwa ostatnią)
**${prefix}move [skąd] [dokąd]** - przenosi pozycję na wybrane miejsce, jeśli istnieje
**${prefix}np** - obecna piosenka
**${prefix}pause** - zatrzymuje piosenkę
**${prefix}resume** - wznawia zatrzymaną piosenkę`);
}