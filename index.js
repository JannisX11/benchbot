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



function relocateMessage(user, channel, trigger_user) {
    channel.send(`${user} Please relocate to the correct help channel. This keeps the server clean and helps us understand the context of your question.
        Not sure which format or help channel to use? Check out the Quickstart Wizard! <https://blockbench.net/quickstart>`.replace(/    /g, ''));
    cmd_channel.send(`${trigger_user||'Unknown user'} used Relocate${user ? ` on a message by ${user}` : ''} in ${channel}.`)
}

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

const Commands = {
    async mobparts(msg, args) {
        let plugin_note = `***Note: **You can use the **CEM Template Loader** plugin to create a working template with the correct part names.*\n`

        let file = await new Promise((resolve, reject) => {
            request(`https://raw.githubusercontent.com/ewanhowell5195/discord_bot_assets/master/cem_models.txt`, (err, res, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body)
            });
        })
        if (!file) return;
        let OptifineMobs = {};
        file.split(/\n/).forEach(line => {
            if (line.substr(0, 1) == '-') return;
            let [key, value] = line.split(/\|(.+)/);
            OptifineMobs[key.trim()] = value;
        })
        

        if (args[1]) {
            var bones = OptifineMobs[args[1]];
            if (bones) {
                msg.channel.send(`${plugin_note}The entity '${args[1]}' has the following parts: \n\`\`\`${bones}\`\`\``);
            } else {
                msg.channel.send(`The entity '${args[1]}' cannot be changed with OptiFine.`);
            }
        } else {
            msg.channel.send(`${plugin_note}OptiFine support the following entities: \n\`\`\`${Object.keys(OptifineMobs).join(', ')}\`\`\``);
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
            if (!archive_channel) return:

            var image = new Discord.MessageAttachment(msg.attachments.first().url);
            let message_text = msg.content.replace(/^\[P\]\s*/, '')
            let [title, description] = message_text.split(/\n([\s\S]+)/);
            let embed = new Discord.MessageEmbed({
                color: '#3e90ff',
                type: 'image',
                url: msg.url,
                author: {
                    name: msg.author.username,
                    iconURL: msg.author.avatarURL
                },
                title,
                description,
                image
            });
            archive_channel.send(embed);
        }
        return;
    }

    if (msg.content && msg.content.substr(0, 1) == '!') {
        var args = msg.content.split(' ');
        var cmd = args[0].substr(1)

        if (cmd == 'faq') {
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
                } else {
                    msg.channel.send(`Question not found`);
                }
                saveSettings();

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
            relocateMessage('', msg.channel, msg.author)
            return;
        }

        if (cmd == 'job') {

            if (args[1] == 'new') {

                if (msg.channel.type != 'dm') {
                    if (Math.random() < 0.05) {
                        msg.channel.send('Slide into my DMs to create a new job post!')
                    } else {
                        msg.channel.send('You can only use this command in my DMs')
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
    
                    j.artist = await askDMQuestion('Are you looking for __work__ or are you looking for an __artist__? Please reply with the underlined keyword.', 'artist');
                    if (j.artist instanceof Rejection) return j.artist;
    
                    if (j.artist) {
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
                            `**Portfolio:** <${j.portfolio}>`,
                            `---------------`,
                        ].join('\n');
                    }
    
    
                    msg.author.send(`Do you want to submit the following job post? (__yes__/__no__)`);
                    j.submit = await askDMQuestion(j.full_post, 'yes');
                    if (j.submit instanceof Rejection) return j.submit;

                    if (j.submit) {
                        var job_list_channel = Bot.channels.cache.find(ch => ch.name === 'job-list');
                        job_list_channel.send(j.full_post).then(list_msg => {
                            msg.author.send(`The job post has been posted to the job-list channel. You can remove it by reacting with the :delete: emoji.`);
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

    if (name == 'relocate' && !reaction.message.author.bot && reaction.count == 1) {
        relocateMessage(reaction.message.author, reaction.message.channel, user)
        reaction.message.react(reaction.emoji).then(console.log).catch(console.log)
        reaction.emoji

    } else if (name == 'delete' || name == '❌') {
        if (reaction.message.mentions.has(user) && reaction.message.author.bot) {
            reaction.message.delete()
        }
    }
})

