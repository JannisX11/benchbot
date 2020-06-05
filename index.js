const Discord = require('discord.js');
var stringSimilarity = require('string-similarity');
var fs = require('fs')

const Bot = new Discord.Client();
var TOKEN = process.env.token;


const messageAwaiters = [];
const OptifineMobs = {};
let McreatorCooldown = false;

const cl = console.log;
var cmd_channel;
Math.clamp = (n, a, b) => n < a ? a : n > b ? b : n;
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
Array.prototype.random = function() {
    return this[Math.floor(Math.random()*this.length)]
}


Bot.login(TOKEN)

Bot.on('ready', msg => {
    cl('Bot Online')
    cmd_channel = Bot.channels.cache.find(ch => ch.name === 'bot-commands');
    if (cmd_channel) {
        cmd_channel.send('I am back online!')
    }
})



function relocateMessage(user, channel) {
    channel.send(`${user} Please relocate to the correct help channel. This keeps the server clean and helps us understand the context of your question.
        Not sure which format or help channel to use? Check out the Quickstart Wizard! <https://blockbench.net/quickstart>`.replace(/    /g, ''))
}

const userdata_path = './benchbot_settings.json'


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
        
            var img = new Discord.MessageAttachment(msg.attachments.first().url);
            var archive_channel = Bot.channels.cache.find(ch => ch.name === 'model-archive');
    
            var text = `**Model by ${msg.author}**`;
            var title = msg.content.replace(/^\[P\]\s*/, '')
            if (title) {
                text += `\n*"${title}"*`;
            }
            text += `\n${msg.url}`
            if (archive_channel) {
                archive_channel.send(text, img)
            }
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

        if (cmd == 'mobparts' && msg.channel.name === 'help-optifine') {
            let plugin_note = `***Note: **You can use the **CEM Template Loader** plugin to create a working template with the correct part names.*\n`
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
            relocateMessage('', msg.channel)
            return;
        }

        if (cmd == 'job') {

            if (args[1] == 'new') {
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
    
                    j.artist = await askDMQuestion('Are you looking for a __job__ or are you looking for an __artist__? Please reply with the underlined keyword.', 'artist');
                    if (j.artist instanceof Rejection) return j.artist;
    
                    if (j.artist) {
                        j.position = await askDMQuestion(`Are you offering a __single__ commission or a __long-term__ position? Or do you offer __both__?`, ['single', 'long-term', 'both']);
                        if (j.position instanceof Rejection) return j.position;
    
                        j.company = await askDMQuestion(`Are you recruiting for a team/company? (__yes__/__no__)`, 'yes');
                        if (j.company instanceof Rejection) return j.company;
    
                        if (j.company) {
                            j.about = await askDMQuestion(`Tell me a bit about your team or company`);
                            if (j.about instanceof Rejection) return j.about;
                        } else {
                            j.about = await askDMQuestion(`Tell me a bit about yourself`);
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
        relocateMessage(reaction.message.author, reaction.message.channel)
        reaction.message.react(reaction.emoji).then(console.log).catch(console.log)
        reaction.emoji

    } else if (name == 'delete' || name == '❌') {
        if (reaction.message.mentions.has(user) && reaction.message.author.bot) {
            reaction.message.delete()
        }
    }
})

OptifineMobs['horse']               = 'body, neck, back_left_leg, back_right_leg, front_left_leg, front_right_leg, tail, saddle, head, mane, mouth, left_ear, right_ear, left_bit, right_bit, left_rein, right_rein, '+
                                        'headpiece, noseband, child_back_left_leg, child_back_right_leg, child_front_left_leg, child_front_right_leg';
OptifineMobs['armor_stand']         = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg, right, left, waist, base';
OptifineMobs['banner']              = 'slate, stand, top';
OptifineMobs['bat']                 = 'head, body, right_wing, left_wing, outer_right_wing, outer_left_wing';
OptifineMobs['bed']                 = 'head, foot, leg1 ... leg4';
OptifineMobs['blaze']               = 'head, stick1 ... stick12';
OptifineMobs['boat']                = 'bottom, back, front, right, left, paddle_left, paddle_right, bottom_no_water';
OptifineMobs['book']                = 'cover_right, cover_left, pages_right, pages_left, flipping_page_right, flipping_page_left, book_spine';
OptifineMobs['cat']                 = 'back_left_leg, back_right_leg, front_left_leg, front_right_leg, tail, tail2, head, body';
OptifineMobs['cave_spider']         = 'head, neck, body, leg1 ... leg8';
OptifineMobs['chest']               = 'lid, base, knob';
OptifineMobs['chest_large']         = 'lid, base, knob';
OptifineMobs['chicken']             = 'head, body, right_leg, left_leg, right_wing, left_wing, bill, chin';
OptifineMobs['cod']                 = 'body, fin_back, head, nose, fin_right, fin_left, tail';
OptifineMobs['cow']                 = 'head, body, leg1 ... leg4';
OptifineMobs['creeper']             = 'head, armor, body, leg1 ... leg4';
OptifineMobs['dragon']              = 'head, spine, jaw, body, rear_leg, front_leg, rear_leg_tip, front_leg_tip, rear_foot, front_foot, wing, wing_tip';
OptifineMobs['donkey']              =  OptifineMobs['horse']
OptifineMobs['dolphin']             = 'body, back_fin, left_fin, right_fin, tail';
OptifineMobs['drowned']             = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['ender_chest']         = 'lid, base, knob';
OptifineMobs['end_crystal']         = 'cube, glass, base';
OptifineMobs['end_crystal_no_base'] = 'cube, glass';
OptifineMobs['enderman']            = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['endermite']           = 'body1 ... body4';
OptifineMobs['evoker']              = 'head, body, arms, left_leg, right_leg, nose, left_arm, right_arm';
OptifineMobs['evoker_fangs']        = 'base, upper_jaw, lower_jaw';
OptifineMobs['fox']                 = 'head, body, leg1 ... leg4, tail';
OptifineMobs['ghast']               = 'body, tentacle1 ... tentacle9';
OptifineMobs['giant']               = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['guardian']            = 'body, eye, spine1 ... spine12, tail1 ... tail3';
OptifineMobs['head_dragon']         = 'head, jaw';
OptifineMobs['head_humanoid']       = 'head';
OptifineMobs['head_skeleton']       = 'head';
OptifineMobs['illusioner']          = 'head, body, arms, left_leg, right_leg, nose, left_arm, right_arm';
OptifineMobs['iron_golem']          = 'head, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['lead_knot']           = 'knot';
OptifineMobs['llama']               = 'head, body, leg1 ... leg4';
OptifineMobs['magma_cube']          = 'core, segment1 ... segment8';
OptifineMobs['minecart']            = 'bottom, back, front, right, left, dirt';
OptifineMobs['mooshroom']           = 'head, body, leg1 ... leg4';
OptifineMobs['mule']                =  OptifineMobs['horse']
OptifineMobs['ocelot']              = 'back_left_leg, back_right_leg, front_left_leg, front_right_leg, tail, tail2, head, body';
OptifineMobs['panda']               = 'head, body, leg1 ... leg4';
OptifineMobs['parrot']              = 'head, body, tail, left_wing, right_wing, left_leg, right_leg';
OptifineMobs['phantom']             = 'body, left_wing, left_wing_tip, right_wing, right_wing_tip, head, tail, tail2';
OptifineMobs['puffer_fish_big']     = 'body, fin_right, fin_left, spikes_front_top, spikes_middle_top, spikes_back_top, spikes_front_right, spikes_front_left,  spikes_front_bottom, spikes_middle_bottom, spikes_back_bottom, spikes_back_right, spikes_back_left';
OptifineMobs['puffer_fish_medium']  = 'body, fin_right, fin_left, spikes_front_top, spikes_back_top, spikes_front_right, spikes_back_right, spikes_back_left, spikes_front_left, spikes_back_bottom, spikes_front_bottom';
OptifineMobs['puffer_fish_small']   = 'body, eye_right, eye_left, tail, fin_right, fin_left';
OptifineMobs['pig']                 = 'head, body, leg1 ... leg4';
OptifineMobs['pillager']            = 'head, body, arms, left_leg, right_leg, nose, left_arm, right_arm';
OptifineMobs['polar_bear']          = 'head, body, leg1 ... leg4';
OptifineMobs['rabbit']              = 'left_foot, right_foot, left_thigh, right_thigh, body, left_arm, right_arm, head, right_ear, left_ear, tail, nose';
OptifineMobs['ravager']             = 'head, jaw, body, leg1 ... leg4, neck';
OptifineMobs['salmon']              = 'body_front, body_back, head, fin_back_1, fin_back_2, tail, fin_right, fin_left';
OptifineMobs['sheep']               = 'head, body, leg1 ... leg4';
OptifineMobs['sheep_wool']          = 'head, body, leg1 ... leg4';
OptifineMobs['shulker']             = 'head, base, lid';
OptifineMobs['shulker_box']         = 'base, lid';
OptifineMobs['shulker_bullet']      = 'bullet';
OptifineMobs['sign']                = 'board, stick';
OptifineMobs['silverfish']          = 'body1 ... body7, wing1 ... wing3';
OptifineMobs['skeleton']            = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['skeleton_horse']      =  OptifineMobs['horse']
OptifineMobs['slime']               = 'body, left_eye, right_eye, mouth';
OptifineMobs['snow_golem']          = 'body, body_bottom, head, left_hand, right_hand';
OptifineMobs['spawner_minecart']    = 'bottom, back, front, right, left, dirt';
OptifineMobs['spider']              = 'head, neck, body, leg1, ... leg8';
OptifineMobs['squid']               = 'body, tentacle1 ... tentacle8';
OptifineMobs['stray']               = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['tnt_minecart']        = 'bottom, back, front, right, left, dirt';
OptifineMobs['tropical_fish_a']     = 'body, tail, fin_right, fin_left, fin_top';
OptifineMobs['tropical_fish_b']     = 'body, tail, fin_right, fin_left, fin_top, fin_bottom';
OptifineMobs['turtle']              = 'head, body, leg1 ... leg4, body2';
OptifineMobs['vex']                 = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg, left_wing, right_wing';
OptifineMobs['villager']            = 'head, headwear, headwear2, body, bodywear, arms, left_leg, right_leg, nose';
OptifineMobs['vindicator']          = 'head, body, arms, left_leg, right_leg, nose, left_arm, right_arm';
OptifineMobs['witch']               = 'head, headwear, headwear2, body, bodywear, arms, left_leg, right_leg, nose, mole';
OptifineMobs['wither']              = 'body1 ... body3, head1 ... head3';
OptifineMobs['wither_skeleton']     = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['wither_skull']        = 'head';
OptifineMobs['wolf']                = 'head, body, leg1 ... leg4, tail, mane';
OptifineMobs['zombie']              = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['zombie_horse']        =  OptifineMobs['horse']
OptifineMobs['zombie_pigman']       = 'head, headwear, body, left_arm, right_arm, left_leg, right_leg';
OptifineMobs['zombie_villager']     = 'head, headwear, body, left_arm, right_arm, left_leg';
