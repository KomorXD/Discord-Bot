const ytdl   = require('ytdl-core');
const yt     = require('youtube-search');
const Config = require('./cfg.json');
const Utils  = require('./utils.js');

const queue = new Map();

exports.PlaySong = async(msg) => {
    const args = msg.content.split(' ');
    const voiceChannel = msg.member.voiceChannel;
    const srvQueue = queue.get(msg.guild.id);

    if(!voiceChannel)
        return msg.channel.send('Trzeba być na kanale jakimś');
    
    const perms = voiceChannel.permissionsFor(msg.client.user);

    if(!perms.has('CONNECT') || !perms.has('SPEAK'))
        return msg.channel.send('Nie mam uprawnień, żeby wejść / mówić =(');

    if(args[1].includes('https://youtube.com') || args[1].includes('https://www.youtube.com') || args[1].includes('http://youtube.com') || args[1].includes('http://www.youtube.com') || args[1].includes('http://youtu.be') || args[1].includes('http://www.youtu.be') || args[1].includes('https://youtu.be') || args[1].includes('https://www.youtu.be')) {

        msg.channel.send(`:mag_right: **Szukam:** \`${args[1]}\``);
        AddFromURL(args[1], srvQueue, msg);
    }
    else {
        msg.content = msg.content.substr(msg.content.indexOf(' ') + 1);
        msg.channel.send(`:mag_right: **Szukam:** \`${msg.content}\``);
        AddFromQuery(msg.content, srvQueue, msg);
    }
}

exports.Stop = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Musisz być na jakimś kanale');

    if(!srvQueue)
        return msg.channel.send('Nie ma czego stopować');

    srvQueue.songs = [];
    srvQueue.connection.dispatcher.end();

    msg.channel.send(':angry: nara');
}

exports.Skip = (msg) => {
    const srvQueue = queue.get(msg.guild.id);
    if(!msg.member.voiceChannel)
        return msg.channel.send('Musisz być na jakimś kanale');
    
    if(!srvQueue)
        return msg.channel.send('Nie ma czego skipować')
    
    srvQueue.connection.dispatcher.end();
    msg.channel.send(':thumbup: Skipnięto');
}

exports.Queue = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!srvQueue || srvQueue.songs.length === 0)
        return msg.channel.send('Kolejka jest pusta!');
    
    let response = `**Teraz grają: **\`${srvQueue.songs[0].title} [${Utils.FormatTime(srvQueue.songs[0].seconds)}] | przez: ${srvQueue.songs[0].requestedBy}\`\n\n`;
    let totalTime = parseInt(srvQueue.songs[0].seconds);

    if(srvQueue.songs.length > 1) {
        response += ':arrow_down: NASTĘPNE :arrow_down:\n';

        for(let i = 1; i < srvQueue.songs.length; i++) {
            response += `**${i}. **\`${srvQueue.songs[i].title} [${Utils.FormatTime(srvQueue.songs[i].seconds)}] | przez: ${srvQueue.songs[i].requestedBy}\`\n`;
            totalTime += parseInt(srvQueue.songs[i].seconds);
        }

        response += `\n**Długość kolejki: **\`${Utils.FormatTime(totalTime)}\``;

        return msg.channel.send(response);
    }
}

exports.Remove = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Wejdź na kanał ; )))))');
    
    if(!srvQueue)
        return msg.channel.send('Nie ma co usuwać');
    
    let tokens = msg.content.split(' ');

    if(tokens.length < 2)
        return msg.channel.send('Daj numerek');
    
    let index = tokens[1];

    if(index === -1) {
        msg.channel.send(`:thumbup: **Usunięto: **\`${srvQueue.songs[srvQueue.songs.length - 1].title}\``);
        srvQueue.songs.splice(srvQueue.songs.length - 1, 1);
    }
    else if(index < srvQueue.songs.length && index > 0) {
        msg.channel.send(`:thumbup: **Usunięto: **\`${srvQueue.songs[index].title}\``);
        srvQueue.songs.splice(index, 1);
    }
}

exports.Move = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Wejdź na kanał ; )))))');
    
    if(!srvQueue)
        return msg.channel.send('Nie ma co ruszać');

    let tokens = msg.content.split(' ');

    if(tokens.length < 3)
        return msg.channel.send('Za mało agrumentów');

    let oldPos = tokens[1];
    let newPos = tokens[2];

    if(oldPos <= 0 || newPos <= 0)
        return msg.channel.send('Pozycje są dodatnie');
    if(oldPos > srvQueue.songs.length || newPos > srvQueue.songs.length - 1)
        return msg.channel.send(`Max. pozycja: ${srvQueue.songs.length - 1}`);

    msg.channel.send(`:thumbup: **Przeniesiono: **\`${srvQueue.songs[oldPos].title}\` z pozycji \`${oldPos}\` na \`${newPos}\``);
    srvQueue.songs.splice(newPos, 0, srvQueue.songs.splice(oldPos, 1)[0]);
}

exports.NowPlaying = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Wejdź na kanał ; )))))');
    
    if(!srvQueue)
        return msg.channel.send('Nic nie grają');

    msg.channel.send(`**Teraz grają: **\`${srvQueue.songs[0].title} [${Utils.FormatTime(srvQueue.connection.dispatcher.time, true)} / ${Utils.FormatTime(srvQueue.songs[0].seconds)}] | przez: ${srvQueue.songs[0].requestedBy}\`\n\n`);
}

exports.Pause = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Wejdź na kanał ; )))))');
    
    if(!srvQueue)
        return msg.channel.send('Nic nie grają');

    srvQueue.connection.dispatcher.pause();
    msg.channel.send(':thumbup: Zatrzymano');
}


exports.Resume = (msg) => {
    const srvQueue = queue.get(msg.guild.id);

    if(!msg.member.voiceChannel)
        return msg.channel.send('Wejdź na kanał ; )))))');
    
    if(!srvQueue)
        return msg.channel.send('Nic nie grają');

    srvQueue.connection.dispatcher.resume();
    msg.channel.send(':thumbup: Wznowiono');
}

const Play = (guild, song) => {
    const srvQueue = queue.get(guild.id);

    if(!song) {
        srvQueue.voiceChannel.leave();
        queue.delete(guild.id);

        return;
    }

    const dispatcher = srvQueue.connection.playStream(ytdl(song.url)).on('end', () => {
        srvQueue.songs.shift();

        Play(guild, srvQueue.songs[0]);
    }).on('error', (err) => {
        console.error(err);
    });

    dispatcher.setVolumeLogarithmic(srvQueue.volume / 5);
}

const AddFromURL = async(url, srvQueue, msg) => {
    const songInfo = await ytdl.getInfo(url);
    let song = {
        title: songInfo.title,
        url: url,
        seconds: songInfo.player_response.videoDetails.lengthSeconds,
        requestedBy: msg.author.username
    };

    if(!srvQueue) {
        const queueContruct = {
            textChannel: msg.channel,
            voiceChannel: msg.member.voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(msg.guild.id, queueContruct);
        queueContruct.songs.push(song);

        try {
            let connection = await msg.member.voiceChannel.join();

            queueContruct.connection = connection;
            Play(msg.guild, queueContruct.songs[0]);
        }
        catch(err) {
            console.log(err);
            queue.delete(msg.guild.id);

            msg.channel.send(err);
        }
    }
    else
        srvQueue.songs.push(song);

    msg.channel.send(`:notes: **Dodano:** \`${song.title}\``);
}

const AddFromQuery = (query, srvQueue, msg) => {
    yt(query, {maxResults: 2, key: Config.yt_token}, (err, res) => {
        if(err)
            msg.channel.send(`Err: ${err}`);
        else {
            let videoURL = res[0]['link'];

            AddFromURL(videoURL, srvQueue, msg);
        }
    })
}