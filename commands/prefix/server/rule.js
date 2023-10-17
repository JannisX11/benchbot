registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "View the server rules.",
    arguments: "[rule]"
  },
  aliases: ["rules"],
  arguments: ["?rule:number"],
  async execute(message, args) {
    if (defined(args[0])) {
      if (args[0] < 1) return sendError(message, {
        title: "Invalid rule",
        description: "The minimum rule number is `1`"
      })
      const rule = db.guilds.rules.get(config.guild, args[0] - 1)
      if (!rule) return sendError(message, {
        title: "Rule not found",
        description: `Rule \`${args[0]}\` was not found`
      })
      return sendMessage(message, {
        author: ["Rules", client.icons.logs],
        description: `## Rule ${args[0]}: ${rule[0]}\n${rule[1]}`,
        components: [makeRow({
          buttons: [{
            customId: `delete_${message.author.id}`,
            emoji: client.emotes.binWhite,
            style: "red"
          }]
        })]
      })
    }
    const rules = db.guilds.rules.all(config.guild)
    if (!rules.length) return sendError(message, {
      title: "No rules",
      description: "There are no rules set up in this server"
    })
    const embeds = []
    let description = ""
    for (const [i, rule] of rules.entries()) {
      const text = `## ${i + 1}: ${rule[0]}${rule[1] ? `\n${rule[1]}` : ""}\n`
      if (description.length + text.length > 4096) {
        embeds.push({ description })
        description = ""
      }
      description += text
    }
    if (description) embeds.push({ description })
    embeds[0].author = ["Rules", client.icons.logs]
    sendMessage(message, {
      embeds,
      components: [makeRow({
        buttons: [{
          customId: `delete_${message.author.id}`,
          emoji: client.emotes.binWhite,
          style: "red"
        }]
      })]
    })
  }
})