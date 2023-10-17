registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Remove a rule from the server rules.",
    arguments: "[rule]"
  },
  guildOnly: true,
  aliases: ["ruleremove"],
  arguments: ["rule:number"],
  async execute(message, args) {
    if (args[0] < 1) return sendError(message, {
      title: "Invalid rule",
      description: "The minimum rule number is `1`"
    })
    const rule = db.guilds.rules.get(message.guildId, args[0] - 1)
    if (!rule) return sendError(message, {
      title: "Rule not found",
      description: `Rule \`${args[0]}\` was not found`
    })
    const check = await confirm(message, {
      description: `Are you sure you want to remove rule \`${args[0]}\`?`,
      danger: true,
      text: "Remove",
      emoji: client.emotes.binWhite,
      embeds: [{
        author: ["Rules", client.icons.logs],
        description: `## Rule ${args[0]}: ${rule[0]}\n${rule[1]}`
      }],
      keep: true
    })
    if (!check[0]) return editMessage(check[1], {
      description: "The rule removal has been aborted",
      components: []
    })
    db.guilds.rules.remove(message.guildId, args[0] - 1)
    sendMessage(message, {
      title: "Rule removed",
      description: `Rule \`${args[0]}\` has been removed`,
      processing: check[1],
      components: []
    })
  }
})