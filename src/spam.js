const {getChannel} = require('./util');

module.exports = function DetectSpam(msg) {
    if (msg.content.match(/https?:\/\//i) &&
        (
            msg.content.match(/nitro/i) ||
            msg.content.match(/d.*\.gift\//i)
        ) &&
        !msg.member.roles.cache.find(role => role.name == 'Moderator') &&
        !msg.content.includes('.epicgames.com/') &&
        !msg.content.includes('.discord.com/')
    ) {
        msg.delete();
        msg.member.kick('Automatic spam detection');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to spam free nitro, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/[´`]/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;
    } else if (msg.content.includes('@everyone') && !msg.member.roles.cache.find(role => role.name == 'Moderator')) {
        msg.delete();
        msg.member.kick('Pinged everyone');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to ping everyone, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/[´`]/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;
    }
}