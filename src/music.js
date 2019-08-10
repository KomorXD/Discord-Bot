const ytdl = require('ytdl-core');
const YT   = require('youtube-search');
const Cfg  = require('./cfg.json');
const Time = require('./time');

// Songs queue, one for every server (guild.id => serverQueue)
const queue = new Map();

// Adds song to the queue and plays it, if the queue is empty
exports.AddSong = async (message) => {
    const args         = message.content.split(' ');
    const voiceChannel = message.member.voiceChannel;
    const serverQueue  = queue.get(message.guild.id);

    // Check if the arguments were provided
    if(args.length < 2)
        return message.channel.send('Not enough arguments were provided');

    // Check if the user is on a voice channel
    if(!voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    const perms = voiceChannel.permissionsFor(message.client.user);

    // Check if the bot has required permissions
    if(!perms.has('CONNECT') || !perms.has('SPEAK'))
        return message.channel.send('I have no permissions to play a song (CONNECT and/or SPEAK)');

    // Check if the argument is whether a YouTube link, or keywords
    if(args[1].includes('https://youtube.com') || args[1].includes('https://www.youtube.com') || args[1].includes('http://youtube.com') || args[1].includes('http://www.youtube.com') || args[1].includes('http://youtu.be') || args[1].includes('http://www.youtu.be') || args[1].includes('https://youtu.be') || args[1].includes('https://www.youtu.be')) {
        message.channel.send(`:mag_right: **Searching:** \`${args[1]}\``);
        AddSongUsingURL(args[1], serverQueue, message);
    }
    else {
        let keywords = message.content.substr(message.content.indexOf(' ') + 1);

        message.channel.send(`:mag_right: **Searching:** \`${keywords}\``);
        AddSongUsingKeywords(keywords, serverQueue, message);
    }
}

// Stop the music bot
exports.Stop = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('There is no song to stop!');

    // Clear the server queue and leave a voice channel
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    message.channel.send(':angry: cya');
}

// Skip a song
exports.SkipSong = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('There is no song to skip!');

    // End the current song, so the next one is played
    serverQueue.connection.dispatcher.end();
    message.channel.send(':thumbsup: Skipped');
}

// Print songs queue
exports.PrintQueue = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the sevrer queue is empty
    if(!serverQueue || serverQueue.songs.length === 0)
        return message.channel.send('The queue is empty');

    let firstSong = serverQueue.songs[0];
    let response = `**Now playing:** \`${firstSong.title} [${Time.FormatTimeInSeconds(firstSong.seconds)}] | requested by: ${firstSong.requestedBy}\`\n\n`;
    let totalTime = parseInt(firstSong.seconds);

    // Loop through every song
    for(let i = 1; i < serverQueue.songs.length; i++) {
        response += `**${i}. **\`${serverQueue.songs[i].title} [${Time.FormatTimeInSeconds(serverQueue.songs[i].seconds)}] | requested by: ${serverQueue.songs[i].requestedBy}\`\n`;
        totalTime += parseInt(serverQueue.songs[i].seconds);
    }

    response += `\n**Total length:** \`${Time.FormatTimeInSeconds(totalTime)}\``;

    return message.channel.send(response);
}

// Remove a song from queue
exports.RemoveSong = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('The queue is empty');

    let tokens = message.content.split(' ');

    // Check if enough arguments were provided
    if(tokens.length < 2)
        return message.channel.send('Not enough arguments were provided');

    let index = tokens[1];

    if(index === -1) {
        message.channel.send(`:thumbsup: **Removed:** \`${serverQueue.songs[serverQueue.songs.length - 1].title}\``);
        serverQueue.songs.splice(serverQueue.songs.length - 1, 1);
    }
    else if(index < serverQueue.songs.length && index > 0) {
        message.channel.send(`:thumbsup: **Removed:** \`${serverQueue.songs[index].title}\``);
        serverQueue.songs.splice(index, 1);
    }
}

// Move a song
exports.MoveSong = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('The queue is empty');

    let tokens = message.content.split(' ');

    // Check if enough arguments were provided
    if(tokens.length < 3)
        return message.channel.send('Not enough arguments were provided');

    let oldPos = tokens[1];
    let newPos = tokens[2];

    // Check if the arguments are valid
    if(oldPos <= 0 || newPos <= 0)
        return message.channel.send('No such positions');
    if(oldPos > serverQueue.songs.length || newPos > serverQueue.songs.length - 1)
        return message.channel.send('No such positions');

    message.channel.send(`:thumbup: **Moved:** \`${serverQueue.songs[oldPos].title}\` from \`${oldPos}\` to \`${newPos}\``);
    serverQueue.songs.splice(newPos, 0, serverQueue.songs.splice(oldPos, 1)[0]);
}

// Print current song info
exports.PrintCurrentSongInfo = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('Nothing is being played right now');

    message.channel.send(`**Now playing:** \`${serverQueue.songs[0].title} [${Time.FormatTimeInMs(serverQueue.connection.dispatcher.time)} / ${Time.FormatTimeInSeconds(serverQueue.songs[0].seconds)}] | requested by: ${serverQueue.songs[0].requestedBy}\`\n\n`);
}

// Pause current song
exports.PauseSong = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('Nothing is being played right now');

    serverQueue.connection.dispatcher.pause();
    message.channel.send(':thumbsup: Paused');
}

// Resume current song
exports.ResumeSong = (message) => {
    const serverQueue = queue.get(message.guild.id);

    // Check if the user is present on a voice channel
    if(!message.member.voiceChannel)
        return message.channel.send('You must be present on a voice channel!');

    // Check if the server queue is empty
    if(!serverQueue)
        return message.channel.send('Nothing is being played right now');

    serverQueue.connection.dispatcher.resume();
    message.channel.send(':thumbsup: Resumed');
}

// Play a song
const PlaySong = (guild, song) => {
    const serverQueue = queue.get(guild.id);

    // Check if the queue has just ran out of songs (after the last song was shifted, songs[0] is null)
    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);

        return;
    }

    // Set dispatcher, play a song, skip to the next on end, look for errors
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url)).on('end', () => {
        // Play the next song, if the current has finished
        serverQueue.songs.shift();

        PlaySong(guild, serverQueue.songs[0]);
    }).on('error', (err) => {
        console.log(err);
    });

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

// Add a song using URL
const AddSongUsingURL = async (url, serverQueue, message) => {
    const songInfo = await ytdl.getInfo(url);
    let song = {
        title: songInfo.title,
        url: url,
        seconds: songInfo.player_response.videoDetails.lengthSeconds,
        requestedBy: message.author.username
    };

    // If the server queue is empty, create it
    if(!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: message.member.voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        }

        queue.set(message.guild.id, queueContruct);
        queueContruct.songs.push(song);

        try {
            let connection = await message.member.voiceChannel.join();

            queueContruct.connection = connection;
            PlaySong(message.guild, queueContruct.songs[0]);
        } catch(err) {
            console.log(err);
            queue.delete(message.guild.id);
            message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
    }

    message.channel.send(`:notes: **Added:** \`${song.title}\``);
}

// Add a song using keywords
const AddSongUsingKeywords = (keywords, serverQueue, message) => {
    YT(keywords, {maxResults: 2, key: Cfg.yt_token}, (err, res) => {
        if(err)
            message.channel.send(`Error: ${err}`);
        else
            AddSongUsingURL(res[0]['link'], serverQueue, message);
    });
}