registerEvent(scriptName, async interaction => {
  if (isType.interaction(interaction, "ApplicationCommand")) {
    if (isType.command(interaction, "ChatInput")) return runSlashCommand(interaction)
    else return runContextCommand(interaction)
  } else if (isType.interaction(interaction, "ApplicationCommandAutocomplete")) {
    let command = client.slashCommands.get(interaction.commandName)
    let subCommand
    if (!command.execute) {
      subCommand = interaction.options.getSubcommandGroup() ?? interaction.options.getSubcommand()
      command = command.get(subCommand)
      if (!command.execute) {
        subCommand = interaction.options.getSubcommand()
        command = command.get(subCommand)
      }
    }
    let name
    for (const option of interaction.options.data) {
      if (option.focused) {
        name = option.name
        break
      } else if (option.options) for (const option2 of option.options) {
        if (option2.focused) {
          name = option2.name
          break
        } else if (option2.options) for (const option3 of option2.options) {
          if (option3.focused) {
            name = option3.name
            break
          }
        }
      }
    }
    const autocomplete = command.options.find(e => (e.name ?? e.type) === name).autocomplete
    if (typeof autocomplete === "function") autocomplete(interaction, interaction.options.getFocused().toLowerCase(), interaction.options)
    else if (Array.isArray(autocomplete)) interaction.respond(filteredSort(autocomplete, interaction.options.getFocused().toLowerCase(), 25).map(e => ({ name: e, value: e })))
    else {
      const split = autocomplete.split(":")
      client.autocompletes.get(split[0]).execute(interaction, interaction.options.getFocused().toLowerCase(), interaction.options, split[1])
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith("delete_")) {
      if (interaction.user.id === interaction.customId.match(/^delete_(\d+)$/)[1] || hasPerm(interaction.member, "ManageMessages", interaction.channel) || isMod(interaction.member)) {
        deleteMessage(interaction.message)
        if (interaction.message.reference) {
          const message = await getMessage(interaction.channel, interaction.message.reference.messageId)
          if (message && !message.attachments?.size) deleteMessage(message)
        }
        return
      }
      return sendPrivateMessage(interaction, { description: "Only the message author can do that" })
    }
  }
})