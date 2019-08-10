const Cfg = require('./cfg.json');
const Cmd = require('./cmd.js');

// Check if the message is whether a command or not and forward it
exports.HandleMessage = (message) => {
    if(message.content.startsWith(Cfg.prefix))
        Cmd.HandleCommand(message);
    else {
        if(message.content.toLowerCase() === 'ping')
            message.channel.send('pong');
    }
}