const {getChannel} = require('./util');

function hasRole(member, role_name) {
    return !!member.roles.cache.find(role => role.name == role_name);
}

module.exports = function DetectSpam(msg) {
    if (msg.content.match(/https?:\/\//i) &&
        (
            msg.content.match(/nitro/i) ||
            msg.content.match(/d.*\.gift\//i)
        ) &&
        !hasRole(msg.member, 'Moderator') &&
        !msg.content.includes('.epicgames.com/') &&
        !msg.content.includes('.discord.com/')
    ) {
        msg.delete();
        msg.member.kick('Discord Nitro spam');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to spam free nitro, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/[´`]/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;

    } else if (msg.content.includes('@everyone') && !hasRole(msg.member, 'Moderator')) {
        msg.delete();
        msg.member.kick('Pinged everyone');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} attempting to ping everyone, and kicked user off the server.
			\`\`\`
			${msg.content.replace(/[´`]/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;

    } else if (msg.content.match(/https?:\/\//i) &&
        msg.content.match(/game/i) &&
        msg.content.match(/play|test/i) &&
        !msg.content.includes('map') &&
        !hasRole(msg.member, 'Moderator')
    ) {
        msg.delete();
        msg.member.kick('Game test spam');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} and kicked user off the server. Likely game-test spam with a malicious link.
			\`\`\`
			${msg.content.replace(/[´`]/g, "'")}
			\`\`\`
        `.replace(/\t/g, ''));
		return true;
    }
}