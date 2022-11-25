/**
 * Thanks Ewan Howell (https://www.ewanhowell.com) for most of this code + the API
 */

const Discord = require('discord.js');
const request = require('request');
let stringSimilarity = require('string-similarity');


module.exports = async function MobpartsCommand(message, args, Bot) {
	args.shift();
	const data = await new Promise((resolve, reject) => {
		request(`https://wynem.com/assets/json/cem_template_models.json`, async (err, res, body) => {
			if (err) {
				reject(err);
				return;
			}
			let d = JSON.parse(body);
			resolve(d)
		});
	})
	const supported = data.categories.find(e => e.name === "Supported").entities
	const legacy = data.categories.find(e => e.name === "Legacy")?.entities
	const unsupported = data.categories.find(e => e.name === "Unsupported")?.entities ?? []
	const unreleased = data.categories.find(e => e.name === "Unreleased")?.entities ?? []
	const supportedEntities = supported.map(e => e.name ?? e)
	const legacyEntities = legacy.map(e => e.name ?? e)
	const unsupportedEntities = unsupported.map(e => e.name ?? e)
	const unreleasedEntities = unreleased.map(e => e.name ?? e)
	const embed = new Discord.MessageEmbed()
		.setColor("#3CB3FA")
		.setFooter({text: "You can use the CEM Template Loader plugin to load a working template with the correct part names and pivot points."})
	if (!args[0]) {
		embed.setTitle("OptiFine Custom Entity Models")
				 .setDescription(`Use \`!mobparts [entity]\` to view the parts of an individual entity\n\n**Supported**\n\`${supportedEntities.join("` `")}\``)
				 .addField("Legacy", `\`${legacyEntities.join("` `")}\``)
		if (unsupportedEntities.length) embed.addField("Unsupported", `\`${unsupportedEntities.join("` `")}\``)
		if (unreleasedEntities.length) embed.addField("Unreleased", `\`${unreleasedEntities.join("` `")}\``)
		const row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageButton()
					.setLabel("View online")
					.setURL("https://www.wynem.com/?cem")
					.setStyle("LINK"),
				new Discord.MessageButton()
					.setLabel("CEM Template Loader")
					.setURL("https://www.blockbench.net/plugins/cem_template_loader")
					.setStyle("LINK")
			)
		return message.reply({
			embeds: [embed],
			allowedMentions: {repliedUser: false},
			components: [row]
		}).catch(() => message.channel.send({
			embeds: [embed],
			components: [row]
		}))
	}
	args[0] = args[0].toLowerCase().replace(/\s/g, "_")
	let entityData
	if (supportedEntities.includes(args[0])) {
		entityData = supported.find(e => (e.name ?? e) === args[0])
	} else if (legacyEntities.includes(args[0])) {
		entityData = legacy.find(e => (e.name ?? e) === args[0])
	} else if (unsupportedEntities.includes(args[0])) {
		entityData = unsupported.find(e => (e.name ?? e) === args[0])
		embed.setFooter({text: "This entity is currently NOT supported by OptiFine"})
	} else if (unreleasedEntities.includes(args[0])) {
		entityData = unreleased.find(e => (e.name ?? e) === args[0])
		embed.setFooter({text: "This entity is currently unreleased"})
	} else{
		embed.setTitle(`The entity \`${args[0].substring(0, 128)}\` was not found`)
		var {bestMatch} = stringSimilarity.findBestMatch(args[0], supportedEntities.concat(legacyEntities, unsupportedEntities, unreleasedEntities))
		embed.setDescription(`Did you mean \`${bestMatch.target}\`?`)
		embed.setFooter({text: ""})
		return message.reply({
			embeds: [embed],
			allowedMentions: {repliedUser: false}
		}).catch(() => message.channel.send({
			embeds: [embed]
		}))
	}
	const bones = JSON.parse(data.models[entityData.model ?? entityData.name ?? entityData].model).models.map(e => e.part)
	const entityName = entityData.display_name ?? (entityData.name ?? entityData).replace(/_/g, " ").toTitleCase()
	embed.setTitle(entityName)
	embed.setDescription(`\`${bones.join("` `")}\``)
	embed.setThumbnail(`https://wynem.com/assets/images/minecraft/renders/${args[0]}.webp`)
	const row = new Discord.MessageActionRow()
		.addComponents(
			new Discord.MessageButton()
				.setLabel("View online")
				.setURL(`https://beta.wynem.com/cem/?entity=${args[0]}`)
				.setStyle("LINK"),
			new Discord.MessageButton()
				.setLabel("Download template")
				.setURL(`https://beta.wynem.com/cem/?entity=${args[0]}&download`)
				.setStyle("LINK")
		)
	return message.reply({
		embeds: [embed],
		allowedMentions: {repliedUser: false},
		components: [row]
	}).catch(() => message.channel.send({
		embeds: [embed],
		components: [row]
	}))
}
