registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: [
      "Submit a model to the archive!",
      'Messages in #model-showcase can be prefixed with "[P]" instead of running this command.',
      "This command requires a message attachment image.",
      "To add a description in a prefix command, use a new line after the title."
    ],
    arguments: "[title]"
  },
  typingless: true,
  aliases: ["submit", "artchive", "pinmodel", "[p]"],
  arguments: ["*title"],
  async execute(message, args) {
    args[0] = args[0].replace(/^\[p\]\s?/i, "")
    if (!args[1]) {
      [args[0], args[1]] = args[0].split(/(?<=^[^\n]*)\n/)
    }
    const images = Array.from(message.attachments.filter(e => e.contentType?.startsWith("image/"))).slice(0, 4)
    if (!images.length) return sendError(message, {
      title: "Missing images",
      description: "Please provide at least one image"
    })
    if (args[0].length < 3) return sendError(message, {
      title: "Model title too short",
      description: "The mimimum title length is `3` characters. Please provide a longer title"
    })
    if (args[0].length > 50) return sendError(message, {
      title: "Model title too long",
      description: "The maximum title length is `50` characters. Please provide a shorter title"
    })
    const url = !message.command.application && message.guild ? `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}` : images[0][1].url
    const embeds = [{
      title: args[0],
      url,
      description: `${args[1] ? `${args[1]}\n\n` : ""}**By ${message.author}**`,
      image: images.shift()[1].url,
      thumbnail: avatar(message.member)
    }]
    for (const image of images) embeds.push({
      url,
      image: image[1].url
    })
    const archive = await sendMessage(await getChannel(config.channels.archive), { embeds })
    if (message.command.application) sendMessage(message, {
      description: "The model was added to the archive!",
      ephemeral: true,
      components: [makeRow({
        buttons: [{
          label: "Jump to archive...",
          url: `https://discord.com/channels/${archive.guildId}/${archive.channelId}/${archive.messageId}`
        }]
      })]
    })
    else timedReact(message, client.emotes.success)
    react(archive, config.emotes.like)
    archive.crosspost()
  }
})