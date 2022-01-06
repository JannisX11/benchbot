var fs = require('fs')
var stringSimilarity = require('string-similarity');
const Discord = require('discord.js');

const sort_collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
const FAQ_timeouts = {}

const userdata_path = './../benchbot_settings.json';

var FAQ = {};
fs.readFile(userdata_path, 'utf-8', function (err, data) {
    if (err) return;
    try {
        data = JSON.parse(data);
    } catch (err) {
        return;
    }
    if (data && data.faq) {
        FAQ = data.faq;
    }
    console.log('Successfully fetched settings')
})

function saveSettings() {
    var root = {
        faq: FAQ
    }
    fs.writeFile(userdata_path, JSON.stringify(root), function(err) {
        if (err) throw err;
    });
}


/**
 * Runs the FAQ command
 * @param {Discord.Message} msg 
 * @param {array} args 
 */
module.exports = function FAQCommand(msg, args) {
	if (msg.channel.type != 'DM' && msg.member && FAQ_timeouts[msg.member.id] && FAQ_timeouts[msg.member.id].count >= 2) {
		msg.channel.send('You can DM me to use more commands instead of using them here in the chat.\nThis helps to prevent filling random channels with bot messages and it gives you an easy way to read up on previous questions you asked me.')
		clearTimeout(FAQ_timeouts[msg.member.id].timeout);
		delete FAQ_timeouts[msg.member.id];
		return;
	}

	if (msg.channel.name === 'bot-commands' && args[1] == 'set') {

		var key = args[2];
		var text = args.slice(3).join(' ');
		if (!text) {
			delete FAQ[key];
			msg.channel.send(`Removed the question '${key}'`);
		} else {
			msg.channel.send(`${FAQ[key] ? 'Updated' : 'Added'} the question '${key}'`);
			FAQ[key] = text;
		}
		saveSettings();

	} else if (msg.channel.name === 'bot-commands' && args[1] == 'remove') {

		var key = args[2].toLowerCase();
		if (FAQ[key]) {
			msg.channel.send(`Removed the question '${key}'`);
			delete FAQ[key];
			saveSettings();
		} else {
			msg.channel.send(`Question not found`);
		}

	} else if (msg.channel.name === 'bot-commands' && args[1] == 'rename') {

		var old_name = args[2].toLowerCase();
		var new_name = args[3].toLowerCase();
		if (FAQ[old_name] && new_name) {
			FAQ[new_name] = FAQ[old_name];
			delete FAQ[old_name];
			msg.channel.send(`Renamed the question '${old_name}' to '${new_name}'`);
			saveSettings();
		} else if (!FAQ[old_name]) {
			msg.channel.send(`Question not found`);
		} else {
			msg.channel.send(`Invalid number of arguments`);
		}

	} else if (msg.channel.name === 'bot-commands' && args[1] == 'raw') {

		let key = args[2].toLowerCase()                
		if (FAQ[key]) {
			msg.channel.send('```\n'+FAQ[key]+'\n```');
		}

	} else if (args[1] == 'list' || args[1] == undefined) {
		let keys = Object.keys(FAQ).sort(sort_collator.compare)
		msg.channel.send(`Available questions: \`${keys.join(',  ')}\``);

	} else if (args[1]) {
		let key = args[1].toLowerCase()                
		if (FAQ[key]) {
			msg.channel.send(`${FAQ[key]}`);
		} else {
			var {bestMatch} = stringSimilarity.findBestMatch(key, Object.keys(FAQ));
			if (bestMatch && bestMatch.rating > 0.5) {
				msg.channel.send(`(Result for "${bestMatch.target}")\n${FAQ[bestMatch.target]}`);
			} else {
				msg.channel.send(`Question '${key}' not found!`);
			}
		}
	}
	if (msg.channel.name != 'bot-commands' && msg.member && !msg.member.roles.cache.find(role => role.name == 'Moderator') && msg.channel.type != 'DM') {
		if (FAQ_timeouts[msg.member.id]) {
			FAQ_timeouts[msg.member.id].count++;
		} else {
			FAQ_timeouts[msg.member.id] = {
				timeout: setTimeout(() => {
					delete FAQ_timeouts[msg.member.id];
				}, 1000*80),
				count: 1
			}
		}
	}
}