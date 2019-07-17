const fs = require('fs');

const rankingByMessages = JSON.parse(fs.readFileSync('rankMsg.json', (err) => {
    if(err)
        console.log(err);
}));

exports.IncrementCountFor = (msg) => {
    const srvRank = rankingByMessages[msg.guild.id];

    if(!srvRank) {
        const rankContruct = {};

        rankContruct[msg.author.username] = 1;
        rankingByMessages[msg.guild.id] = rankContruct;
    }
    else {
        let userValue = srvRank[msg.author.username];

        srvRank[msg.author.username] = userValue + 1;
    }

    SaveToJSON();
}

exports.ShowRankingsByMessages = (msg) => {
    const srvRank = rankingByMessages[msg.guild.id];

    if(!srvRank)
        return msg.channel.send('Nikt nic jeszcze nie napisał... (komendy się nie liczą)');

    msg.channel.send(`**:arrow_down: Ranking od ilości wiadomości :arrow_down:**\n`);

    let itr = 1;

    for(let user in srvRank) {
        msg.channel.send(`**${itr}. ** \`${user}\`: ${srvRank[user]}`);
        itr++;
    }
}

const SaveToJSON = () => {
    fs.writeFile('rankMsg.json', JSON.stringify(rankingByMessages), (err) => {
        if(err)
            console.log(err);
    });
}