const {getChannel} = require('./util');

module.exports = function DetectSpam(msg) {
    if (msg.content.includes('@everyone') && !msg.member.roles.cache.find(role => role.name == 'Moderator')) {
        msg.delete();
        msg.member.kick('Attempting to spam');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to ping everyone, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/´/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;
    }
    else if (msg.content.match(/https?:\/\//i) &&
        msg.content.match(/nitro/i) &&
        !msg.member.roles.cache.find(role => role.name == 'Moderator') &&
        !msg.content.includes('.epicgames.com/') &&
        !msg.content.includes('.discord.com/')
    ) {
        msg.delete();
        msg.member.kick('Attempting to spam. Kicked by automatic spam detection. If you thing this was a mistake, please contact us.');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to spam free nitro, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/´/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;
    }
}