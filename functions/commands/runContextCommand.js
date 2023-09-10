registerFunction(scriptName, async interaction => {
  interaction.author = interaction.user
  const command = client.contextCommands.get(interaction.commandName)
  const commandName = command.command
  Object.defineProperty(interaction, "command", {
    get: () => command
  })
  if (await permCheck(interaction, command) !== true) return
  if (!await cooldownCheck(interaction, command)) return
  if (!interaction.member) interaction.member = createMember(interaction.user)
  interaction.commandRun = interaction.commandName
  let args = []
  if (isType.command(interaction, "Message")) interaction.reference = {
    channelId: interaction.channelId,
    messageId: interaction.targetId,
    guildId: interaction.guildId
  }
  else if (isType.command(interaction, "User")) {
    const member = await argTypes.member(interaction.targetId, {
      message: interaction
    })
    if (!member || member instanceof Discord.Message) return
    args.unshift(member)
  }
  if (testMode) await command.execute(interaction, ...args)
  else try {
    await command.execute(interaction, ...args)
  } catch(error) {
    return commandError(interaction, error)
  }
})