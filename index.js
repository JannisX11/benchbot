const Discord = require('discord.js');
var stringSimilarity = require('string-similarity');
var fs = require('fs')
var path = require('path')

const Bot = new Discord.Client();
var TOKEN = process.env.token;

const messageAwaiters = [];
const request = require('request');

const cl = console.log;
var cmd_channel;
Math.clamp = (n, a, b) => n < a ? a : n > b ? b : n;
Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)]
}

const FAQ_timeouts = {

}

Bot.login(TOKEN).catch(err => {
    throw err;
})

Bot.on('ready', msg => {
    cl('Bot Online')
    cmd_channel = Bot.channels.cache.find(ch => ch.name === 'bot-commands');
    if (cmd_channel) {
        cmd_channel.send('I am back online!')
    }
})

const userdata_path = './benchbot_settings.json';

var FAQ = {};
fs.readFile(userdata_path, 'utf-8', function (err, data) {
    console.log(err)
    if (err) return;
    try {
        data = JSON.parse(data);
    } catch (err) {
        return;
    }
    if (data && data.faq) {
        FAQ = data.faq;
    }
    cl('Successfully fetched settings')
})

function saveSettings() {
    var root = {
        faq: FAQ
    }
    fs.writeFile(userdata_path, JSON.stringify(root), function(err) {
        if (err) throw err;
    });
}

function relocateMessage(user, channel, trigger_member) {
    channel.send(`${user} Please relocate to the correct help channel. This keeps the server clean and helps us understand the context of your question.
        Not sure which format or help channel to use? Check out the Quickstart Wizard! <https://blockbench.net/quickstart>`.replace(/    /g, ''));

    if (!trigger_member || !trigger_member.roles || !trigger_member.roles.cache.find(role => role.name == 'Moderator')) {
        cmd_channel.send(`${trigger_member ? trigger_member.user : 'Unknown user'} used Relocate${user ? ` on a message by ${user}` : ''} in ${channel}.`)
    }
}

const Commands = {
    async mobparts(msg, args) {
        let plugin_note = `***Note: **You can use the **CEM Template Loader** plugin to create a working template with the correct part names.*\n`

        let file = await new Promise((resolve, reject) => {
            request(`https://raw.githubusercontent.com/ewanhowell5195/wynem/main/bot_assets/cem_models.json`, (err, res, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body)
            });
        })
        if (!file) return;
        var File;
        try {
            File = JSON.parse(file)
        } catch (err) {
            msg.channel.send(plugin_note + 'Failed to load mob data')
        }

        if (args[1]) {
            var mob = File.entities.supported[args[1]];
            if (mob) {
                msg.channel.send(`${plugin_note}The entity '${mob.display_name}' has the following parts: \n\`\`\`${mob.bones.join(', ')}\`\`\``);
            } else if (File.entities.unsupported[args[1]]) {
                msg.channel.send(`The entity '${args[1]}' cannot be changed with OptiFine.`);
            } else {
                msg.channel.send(`Could find the entity '${args[1]}'`);
            }
        } else {
            msg.channel.send(`${plugin_note}OptiFine support the following entities: \n\`\`\`${Object.keys(File.entities.supported).join(', ')}\`\`\``
			    +`\nThese things can currently not be changed: \n\`\`\`${File.entities.unsupported.join(', ')}\`\`\``);
        }
    },
    /**
     * Runs the FAQ command
     * @param {Discord.Message} msg 
     * @param {array} args 
     */
    faq(msg, args) {
        if (msg.channel.type != 'dm' && msg.member && FAQ_timeouts[msg.member.id] && FAQ_timeouts[msg.member.id].count >= 2) {
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
            msg.channel.send(`Available questions: \`${Object.keys(FAQ).join(',  ')}\``);

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
        if (msg.channel.name != 'bot-commands' && msg.member && !msg.member.roles.cache.find(role => role.name == 'Moderator') && msg.channel.type != 'dm') {
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
}

Bot.on('message', msg => {

    if (msg.author.bot) {
        return;
    }

    if (msg.mentions.members && msg.mentions.members.first() && msg.mentions.members.first().user.id === Bot.user.id) {
        if (msg.content.toLowerCase().includes('ping')) {
            msg.channel.send('Pong')
        }
    }

    
    for (var awaiter of messageAwaiters) {
        if ((msg.channel.type == awaiter.channeltype || !awaiter.channeltype)
        && (msg.channel.name == awaiter.channelname || !awaiter.channelname)
        && (msg.author.id == awaiter.authorid || !awaiter.authorid)
        ) {
            awaiter.trigger(msg);
            messageAwaiters.splice(messageAwaiters.indexOf(awaiter), 1);
        }
    }

    if (msg.channel.name === 'model-showcase' && msg.attachments && msg.content && msg.content.substr(0, 3) === '[P]') {

        var attachment = msg.attachments.first();
        
        if (attachment && ['png', 'jpg', 'jpeg', 'gif'].includes(attachment.url.split('.').pop().toLowerCase())) {
        
            var archive_channel = Bot.channels.cache.find(ch => ch.name === 'model-archive');
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
            archive_channel.send(embed).then(pin => {
                const reactionEmoji = pin.guild.emojis.cache.find(emoji => emoji.name === 'bblike');
                pin.react(reactionEmoji);

                setTimeout(() => {
                    if (!pin.deleted) {
                        pin.crosspost();
                    }
                }, 10 * 60 * 1000)
            });
        }
        return;
    }

    if (msg.content && msg.content.substr(0, 1) == '!') {
        var args = msg.content.split(' ');
        var cmd = args[0].substr(1)

        if (cmd == 'faq') {
            Commands.faq(msg, args)
            return;
        }

        if (cmd == 'mobparts' && (msg.channel.name === 'help-optifine' || msg.channel.type == 'dm')) {
            Commands.mobparts(msg, args);
            return;
        }

        if (cmd == 'help') {
            msg.channel.send(`\`\`\`asciidoc
                = BENCHBOT COMMANDS =

                !help :: List commands
                !faq :: List all possible FAQs
                !faq <name> :: Answers a FAQ
                !mobparts :: Lists all entities that support OptiFine models
                !mobparts <entity> :: Lists all bones of the OptiFine model of entity
                \`\`\`
            `.replace(/    /g, ''))
            return;
        }

        if (cmd == 'relocate') {
            relocateMessage('', msg.channel, msg.member)
            return;
        }

        if (cmd == 'job') {

            if (args[1] == 'new') {

                if (msg.channel.type != 'dm') {
                    if (Math.random() < 0.05) {
                        msg.channel.send(`Slide into my DMs to create a new job post!`)
                    } else {
                        msg.channel.send(`${msg.author} You can only use this command in my DMs`)
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
                           channeltype: 'dm',
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
                        let target_channel = j.is_job_offer ? 'job-list' : 'artist-list'
                        var job_list_channel = Bot.channels.cache.find(ch => ch.name === target_channel);
                        job_list_channel.send(j.full_post).then(list_msg => {
                            msg.author.send(`The job post has been posted to the \`${target_channel}\` channel. You can remove it by reacting with the :delete: emoji.`);
                            setTimeout(_ => {
                                msg.author.send(`Benchbot thanks you for using the job service and wishes you good luck with your offer!`);
                            }, 4332)
                        });
                    } else {
                        j.restart = await askDMQuestion(`Do you want to restart the process? (__yes__/__no__)`, 'yes');
                        if (j.restart) {
                            msg.author.send(`I am restarting the job creation process. Please wait while I get a new pre-printed form...`);
                            setTimeout(_ => {
                                conversationLoop();
                            }, 5000)
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
                }).catch((e, e2) => {
                    msg.channel.send(`Sorry, I can't talk to you because you have DMs disabled.`)
                })
            } else if (args[1] == 'remove') {
    
                msg.channel.send('Please react to your job post with :delete: in order to remove it. If this doesn\'t work, you can contact a moderator to remove it.')
            }
            return;
        }
    }
})



Bot.on('messageReactionAdd', (reaction, user) => {
    let name = reaction._emoji.name
    let {message} = reaction;

    if (name == 'relocate' && !message.author.bot && reaction.count == 1) {
        relocateMessage(message.author, message.channel, message.guild.member(user))
        message.react(reaction.emoji).then(console.log).catch(console.log)

    } else if (name == 'delete' && message.author.bot) {
        if (message.mentions.has(user) || (message.embeds && message.embeds[0] && message.embeds[0].description.includes(user.toString()))) {
            message.delete()
        }
    }
})

