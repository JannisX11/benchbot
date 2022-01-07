var stringSimilarity = require('string-similarity');
let {messageAwaiters} = require('./await_message');
const { getChannel } = require('./util');

module.exports = function JobCommand(msg, args) {
	if (args[1] == 'new') {

		if (msg.channel.type != 'DM') {
			if (Math.random() < 0.05) {
				msg.reply({content: `Slide into my DMs to create a new job post!`, allowedMentions: {repliedUser: false}})
			} else {
				msg.reply({content: `${msg.author} You can only use this command in my DMs`, allowedMentions: {repliedUser: false}})
			}
			return;
		}
		class Rejection {
			constructor(type) {
				this.type = type;
			}
		}
		function askDMQuestion(question, check_reply) {

			msg.author.send(question);
			return new Promise(resolve => {
			   messageAwaiters.push({
				   channeltype: 'DM',
				   authorid: msg.author.id,
				   trigger: function(reply_msg) {

					   if (reply_msg.content == '!cancel' || reply_msg.content == '!job new') {
							resolve(new Rejection(reply_msg.content == '!job new' ? 'restart' : 'stop'));

						} else if (typeof check_reply == 'string') {
							resolve(stringSimilarity.compareTwoStrings(reply_msg.content.toLowerCase(), check_reply) > 0.5);

						} else if (check_reply instanceof Array) {
							let bestMatch = stringSimilarity.findBestMatch(reply_msg.content.toLowerCase(), check_reply)
							resolve(bestMatch.bestMatchIndex)

					   } else {
						   resolve(reply_msg.content);
					   }
				   }
			   }) 
			})
		}
		async function conversation() {
			var j = {};

			for (var i = messageAwaiters.length-1; i >= 0; i--) {
				if (messageAwaiters[i].authorid == msg.author.id) {
					messageAwaiters.splice(i, 1);
				}
			}

			j.is_job_offer = await askDMQuestion('Are you looking for __work__ or are you looking for an __artist__? Please reply with the underlined keyword.', 'artist');
			if (j.is_job_offer instanceof Rejection) return j.is_job_offer;

			if (j.is_job_offer) {
				j.position = await askDMQuestion(`Are you offering a __single__ commission or a __long-term__ position? Or do you offer __both__?`, ['single', 'long-term', 'both']);
				if (j.position instanceof Rejection) return j.position;

				j.company = await askDMQuestion(`Are you recruiting for a team/company? (__yes__/__no__)`, 'yes');
				if (j.company instanceof Rejection) return j.company;

				if (j.company) {
					j.about = await askDMQuestion(`Tell me a bit about your team or company\n`);
					if (j.about instanceof Rejection) return j.about;
				} else {
					j.about = await askDMQuestion(`Tell me a bit about yourself\nDetailed information can help make people interested in your project. Here are some questions for orientation:\n- What do you do, what do you specialize in?\n- How much experience do you have?\n- Have you worked on and finished any projects in the past?`);
					if (j.about instanceof Rejection) return j.about;
				}

				j.assettype = await askDMQuestion(`What type of assets do you need? (__texture__/__model__/__animation__/__build__/etc.)`);
				if (j.assettype instanceof Rejection) return j.assettype;

				j.paid = await askDMQuestion(`Are you able to pay the artist? (__yes__/__no__)`, 'yes');
				if (j.paid instanceof Rejection) return j.paid;

				j.description = await askDMQuestion(`Tell me a bit about the ${j.position ? 'position' : 'job'} you are offering`);
				if (j.description instanceof Rejection) return j.description;


				// compile
				j.pay_type = j.paid ? 'paid' : 'voluntary';

				if (j.position == 0) {
					j.merged_description = `a ${j.pay_type} artist for a single ${j.assettype} job`;

				} else if (j.position == 1) {
					j.merged_description = `a longer term ${j.pay_type} ${j.assettype} artist`;
					
				} else {
					j.merged_description = `a ${j.pay_type} ${j.assettype} artist`;

				}

				j.headline = `${msg.author} **is looking for ${j.merged_description}.**`

				j.full_post = [
					`---------------`,
					j.headline,
					``,
					`**About ${j.company ? 'us' : 'me'}:** ${j.about}`,
					`**About the ${j.position ? 'position' : 'commission'}:** ${j.description}`,
					`---------------`,
				].join('\n');

			} else {
				j.position = await askDMQuestion(`Are you looking for a __single__ commission or a __long-term__ position? Or do you accept __both__?`, ['single', 'long-term', 'both']);
				if (j.position instanceof Rejection) return j.position;

				j.assettype = await askDMQuestion(`What type of assets are you creating? Example: \`models, textures, animations\``);
				if (j.assettype instanceof Rejection) return j.assettype;

				j.portfolio = await askDMQuestion(`Please link your portfolio. This can be your website, your sketchfab page or something else that displays your work.`);
				if (j.portfolio instanceof Rejection) return j.portfolio;

				j.rate = await askDMQuestion(`What is your rate?`);
				if (j.rate instanceof Rejection) return j.rate;

				j.about = await askDMQuestion(`Tell me a bit about yourself. What is your experience and what kind of job are you looking for?`);
				if (j.about instanceof Rejection) return j.about;


				var asset_array = j.assettype.split(/,|and/gm);
				asset_array.forEach((asset, i) => {
					asset_array[i] = asset.trim();
				})
				if (asset_array.length > 1) {
					var last = asset_array.pop();
					asset_array = `${asset_array.join(', ')} and ${last}`;
				} else {
					asset_array = asset_array[0];
				}


				j.full_post = [
					`---------------`,
					`${msg.author}** offers to create ${asset_array}.**`,
					``,
					`**Type:** ${['Commission', 'Longer-Term Position', 'Single or Longer-Term'][j.position]}`,
					`**Rate:** ${j.rate}`,
					`**Description:** ${j.about}`,
					`**Portfolio:** ${j.portfolio}`,
					`---------------`,
				].join('\n');
			}
			
			// Hide link widgets
			j.full_post = j.full_post.replace(/https?:\/\/[\w]+\.[^\s]+/g, (url) => {
				return `<${url}>`;
			})

			msg.author.send(`Do you want to submit the following job post? (__yes__/__no__)`);
			j.submit = await askDMQuestion(j.full_post, 'yes');
			if (j.submit instanceof Rejection) return j.submit;

			if (j.submit) {
				let job_list_channel = getChannel(j.is_job_offer ? 'job-list' : 'artist-list');
				job_list_channel.send(j.full_post).then(list_msg => {
					msg.author.send(`The job post has been posted to the \`${target_channel}\` channel. You can remove it by reacting with the :delete: emoji.`);
					setTimeout(_ => {
						msg.author.send(`Benchbot thanks you for using the job service and wishes you good luck with your offer!`);
					}, 4332)
					msg.channel.sendTyping();
				});
			} else {
				j.restart = await askDMQuestion(`Do you want to restart the process? (__yes__/__no__)`, 'yes');
				if (j.restart) {
					msg.author.send(`I am restarting the job creation process. Please wait while I get a new pre-printed form...`);
					setTimeout(_ => {
						conversationLoop();
					}, 5000)
					msg.channel.sendTyping();
				}
			}
			return true;
		}
		async function conversationLoop() {
			let result = await conversation();
			if (result instanceof Rejection && result.type == 'stop') {
				msg.author.send(`Job interview canceled! Use \`!job new\` to restart.`);
			}
		}
		msg.author.send('Hey, I will guide you through the process of creating a job post! You can use `!cancel` at any time to cancel the conversation.').then(c => {
			setTimeout(_ => {
				conversationLoop()
			}, 4000)
			msg.channel.sendTyping();
		}).catch((e, e2) => {
			msg.channel.send(`Sorry, I can't talk to you because you have DMs disabled.`)
		})
	} else if (args[1] == 'remove') {

		msg.channel.send('Please react to your job post with :delete: in order to remove it. If this doesn\'t work, you can contact a moderator to remove it.')
	}
}