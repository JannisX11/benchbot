const Discord = require('discord.js');
const {getChannel} = require('./util');

/**
 * 
 * @param {Discord.Message} msg 
 * @returns 
 */
module.exports = function ArchiveImage(msg) {
	
	var attachment = msg.attachments.first();
        
	if (attachment && ['png', 'jpg', 'jpeg', 'gif'].includes(attachment.url.split('.').pop().toLowerCase())) {
	
		var archive_channel = getChannel('model-archive');
		if (!archive_channel) return;

		let message_text = msg.content.replace(/^\[P\]\s*/, '')
		let [title, description] = message_text.split(/\n([\s\S]+)/);
		let embed = new Discord.MessageEmbed({
			color: '#3e90ff',
			type: 'image',
			author: {
				name: msg.author.username,
				iconURL: msg.author.avatarURL()
			},
			description: `[**${title}**](${msg.url})\n`
				+ (description ? (description + '\n') : '') + `by ${msg.author}`,
			image: msg.attachments.first()
		});
		archive_channel.send({embeds: [embed]}).then(pin => {
			const reactionEmoji = pin.guild.emojis.cache.find(emoji => emoji.name === 'bblike');
			pin.react(reactionEmoji);

			msg.reply({
				content: `The model was pinned inside #model-archive!\n${pin.url}`,
				allowedMentions: {repliedUser: false},
			});

			setTimeout(() => {
				if (!pin.deleted) {
					pin.crosspost();
				}
			}, 10 * 60 * 1000)
			
		});
	}
}