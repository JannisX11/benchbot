registerPrefixCommand(scriptName, prefixPath, {
  help: {
    description: "Add a new rule to the server rules."
  },
  guildOnly: true,
  aliases: ["ruleadd"],
  permissions: ["ManageGuild"],
  async execute(message, args) {
    const count = db.guilds.rules.count(message.guildId)
    if (count >= 15) return sendError(message, {
      title: "Maximum number of rules",
      description: "The maximum number of rules that you can have is `15`"
    })
    let modalMessage
    if (!message.command.application) {
      modalMessage = await sendMessage(message, {
        description: "Press the button to add a new rule",
        components: [makeRow({
          buttons: [{
            label: "Add rule",
            emoji: client.emotes.pencilWhite,
            customId: "modal"
          }]
        })]
      })
    }
    const rule = []
    if (!await modalHandler(message, modalMessage, {
      title: "Rule Creator",
      rows: [
        {
          "text": {
            id: "rule",
            label: "Rule",
            maxLength: 128,
            placeholder: "No breaking the rules!",
            required: true
          }
        },
        {
          "text": {
            id: "description",
            label: "Rule Description",
            maxLength: 256,
            placeholder: "Do not break the rules or you will be banned.",
            long: true
          }
        }
      ]
    }, async (fields, interaction, message) => {
      rule.push(await insertDiscordMentions(message.guild, fields.rule))
      if (fields.description) rule.push(await insertDiscordMentions(message.guild, fields.description))
      modalMessage = message
      return true
    }, {
      authorOnly: true,
      leave: true
    })) return
    db.guilds.rules.add(message.guildId, rule)
    sendMessage(message, {
      embeds: [
        {
          title: "Rule added",
          description: "The rule has been added to the server\n\nHere is a preview of the rule:"
        },
        {
          author: ["Rules", client.icons.logs],
          description: `## Rule ${count + 1}: ${rule[0]}\n${rule[1]}`
        }
      ],
      processing: modalMessage,
      components: []
    })
  }
})