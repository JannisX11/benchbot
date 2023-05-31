const {getChannel, hasRole} = require('./util');

module.exports = function DetectSpam(msg) {
    if (msg.content.match(/https?:\/\//i) &&
        (
            msg.content.match(/ni(t|Т)r(o|0)/i) ||
            msg.content.match(/d.*\.gift\//i)
        ) &&
        !hasRole(msg.member, 'Moderator') &&
        !msg.content.includes('.epicgames.com/') &&
        !msg.content.includes('.discord.com/') &&
        !msg.content.includes('.nitrocdn.com/')
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
        msg.content.includes(' ') &&
        msg.content.length < 250 &&
        !msg.content.includes('map') &&
        !msg.content.match(/minecraft/i) &&
        !msg.content.match(/blockbench/i) &&
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


    } else if (msg.content.match(/discord\.gg\/\w+/i) &&
        (
            ['bb-themes', 'introductions'].includes(msg.channel.name) ||
            msg.content.match(/discord\.gg\/.*(nudes|family|sex|tiktok|nsfw|18)/i)
        ) &&
        !hasRole(msg.member, 'Moderator')
    ) {
        msg.delete();
        msg.member.kick('Invite spam');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} and kicked user off the server, for posting an invite that was likely spam.
            \`\`\`
            ${msg.content.replace(/[´`]/g, "'")}
            \`\`\`
        `.replace(/\t/g, ''));
        return true;


    } else if (msg.content.match(/\/\/t\.me\/\w+/i) &&
        !hasRole(msg.member, 'Moderator')
    ) {
        msg.delete();
        msg.member.kick('Suspicious link');
        getChannel('bot-log').send(`Deleted a message by ${msg.author} in #${msg.channel} and kicked user off the server, for posting a suspicious Telegram link.
            \`\`\`
            ${msg.content.replace(/[´`]/g, "'")}
            \`\`\`
        `.replace(/\t/g, ''));
        return true;


    } else if (msg.content.match(/what.{2,6}snowstorm.{0,5}$/i) &&
        msg.channel.name == 'snowstorm' &&
        !hasRole(msg.member, 'Moderator')
    ) {
        msg.reply({
			content: 'Read the channel description.',
			allowedMentions: {repliedUser: true}
		});
        return true;
    }
}