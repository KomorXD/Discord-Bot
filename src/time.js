exports.FormatTimeInSeconds = (seconds) => {
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

exports.FormatTimeInMs = (ms) => {
    let seconds = parseInt(ms / 1000);
    
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