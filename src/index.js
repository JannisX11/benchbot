const Discord = require('discord.js');

let {getChannel, setBot} = require('./util')
let FAQCommand = require('./faq')
let MobpartsCommand = require('./mobparts')
let JobCommand = require('./job')
let DetectSpam = require('./spam')
let ArchiveImage = require('./archive')
let {handleMessageAwaiters} = require('./await_message')
let package = require('./../package.json')

//const dotenv = require('dotenv');
//dotenv.config();

const Bot = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
});

var log_channel;

Bot.login(process.env.token).catch(err => {
    throw err;
})

Bot.on('ready', msg => {
    console.log(`Bot Online! Node ${process.version}, Benchbot v${package.version}`)
    setBot(Bot);
    log_channel = getChannel('bot-log')
    if (log_channel) {
        log_channel.send(`I am back online! *v${package.version}*`)
    }
})


function relocateMessage(user, channel, trigger_member) {
    channel.send(`${user} Please relocate to the correct help channel. This keeps the server clean and helps us understand the context of your question.
        Not sure which format or help channel to use? Check out the Quickstart Wizard! <https://blockbench.net/quickstart>`.replace(/    /g, ''));

    if (!trigger_member || !trigger_member.roles || !trigger_member.roles.cache.find(role => role.name == 'Moderator')) {
        log_channel.send(`${trigger_member ? trigger_member.user : 'Unknown user'} used Relocate${user ? ` on a message by ${user}` : ''} in ${channel}.`)
    }
}

Bot.on('messageCreate', msg => {

    if (msg.author.bot) {
        return;
    }


    if (DetectSpam(msg)) return;


    if (msg.mentions.members && msg.mentions.members.first() && msg.mentions.members.first().user.id === Bot.user.id) {
        if (msg.content.toLowerCase().includes('ping')) {
            msg.channel.send('Pong')
        }
    }

    if (msg.content.includes('@Moderator')) {
        log_channel.send(`${msg.author} pinged moderators in ${msg.channel}.`)
    }
    
    handleMessageAwaiters(msg);

    if ((msg.channel.name === 'model-showcase' || msg.channel.name === 'blockbenchtober' || msg.channel.name === 'bot-test') && msg.attachments && msg.content && msg.content.substr(0, 3) === '[P]') {
        ArchiveImage(msg);
        return;
    }

    if (msg.content && msg.content.substr(0, 1) == '!') {
        var args = msg.content.split(' ');
        var cmd = args[0].substr(1)

        if (cmd == 'faq') {
            FAQCommand(msg, args)
            return;
        }

        if (cmd == 'mobparts' && (msg.channel.name === 'help-optifine' || msg.channel.type == 'DM')) {
            MobpartsCommand(msg, args, Bot);
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
                !job new :: Creates a new Job entry. DM only
                \`\`\`
            `.replace(/    /g, ''))
            return;
        }
        

        if (cmd == 'relocate') {
            relocateMessage('', msg.channel, msg.member)
            return;
        }

        if (cmd == 'job') {

            JobCommand(msg, args);
            return;
        }
        
        if (msg.channel.name == 'help-vanilla-java-block-item') {
            msg.startThread({
                name: `${msg.author.username}${msg.author.username.substr(-1) == 's' ? '' : 's'} Question`,
                reason: 'Each question should be contained in a thread',
                autoArchiveDuration: 60,
            }).then(thread => {
                thread.send('This thread was automatically created for answers to the question above!');
            })
        }
    }
})

let relevant_reactions = ['relocate', 'delete'];

Bot.on('messageReactionAdd', async (reaction, user) => {
    let name = reaction._emoji.name
    let {message} = reaction;
    if (!relevant_reactions.includes(name)) return;

    if (!message.author) {
        await message.fetch();
    }

    if (name == 'relocate' && !message.author.bot && reaction.count == 1) {
        relocateMessage(message.author, message.channel, message.guild.members.cache.get(user.id))
        message.react(reaction.emoji)

    } else if (name == 'delete' && message.author.bot) {
        if (message.mentions.has(user) || (message.embeds && message.embeds[0] && message.embeds[0].description.includes(user.toString()))) {
            message.delete().catch(console.error)
        }
    }
})
