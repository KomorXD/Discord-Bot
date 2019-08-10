const Cfg   = require('./cfg.json');
const Music = require('./music');

// Handles commands
exports.HandleCommand = (message) => {
    let msg = message.content.toLowerCase();
    let prefix = Cfg.prefix;

    switch(msg) {
        // Look for commands without arguments
        case `${prefix}help`:
            PrintHelp(message, prefix);
            break;

        case `${prefix}skip`:
            Music.SkipSong(message);
            break;

        case `${prefix}stop`:
            Music.Stop(message);
            break;

        case `${prefix}queue`:
            Music.PrintQueue(message);
            break;

        case `${prefix}np`:
            Music.PrintCurrentSongInfo(message);
            break;
        
        case `${prefix}pause`:
            Music.PauseSong(message);
            break;

        case `${prefix}resume`:
            Music.ResumeSong(message);
            break;

        // Look for commands with arguments
        default: {
            if(msg.startsWith(`${prefix}play`))
                Music.AddSong(message);

            else if(msg.startsWith(`${prefix}remove`))
                Music.RemoveSong(message);

            else if(msg.startsWith(`${prefix}move`))
                Music.MoveSong(message);
        }
    }
}

// Prints info about every command, used by help command
const PrintHelp = (message, prefix) => {
    message.channel.send(`**${prefix}help** - this page
**${prefix}play [link / keywords]** - plays a song specified by link or keywords
**${prefix}skip** - skips current song
**${prefix}stop** - stops the music bot
**${prefix}queue** - shows a songs queue
**${prefix}remove [position]** - removes given position in queue, if exists (-1 removes the last song)
**${prefix}move [position] [desired position]** - moves a song at position to a desired position
**${prefix}np** - shows current song info
**${prefix}pause** - pauses current song
**${prefix}resume** - resumes paused song`);
}