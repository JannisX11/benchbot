registerFunction(scriptName, {
  getFullCommand(interaction) {
    if (!(interaction instanceof Discord.CommandInteraction)) return []
    if (isType.command(interaction, "ChatInput")) {
      const args = [interaction.commandRun]
      interaction.options.data.forEach(option => addArgs(args, option))
      return args.join(" ")
    }
    return interaction.commandName
  },
  addArgs(args, option) {
    if (isType.option(option, "Subcommand") || isType.option(option, "SubcommandGroup")) option.options.forEach(opt => addArgs(args, opt))
    else if (isType.option(option, "Channel")) args.push(`${option.name}:${option.channel}`)
    else if (isType.option(option, "Role")) args.push(`${option.name}:${option.role}`)
    else if (isType.option(option, "Attachment")) args.push(`${option.name}:${option.attachment.attachment}`)
    else if (isType.option(option, "User")) args.push(`${option.name}:${option.user}`)
    else args.push(`${option.name}:${option.value}`)
  }
})