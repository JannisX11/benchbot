registerFunction(scriptName, async (message, args) => {
  let confirmMessage
  const contents = {
    embeds: [
      {
        title: args.title,
        author: args.danger ? ["Warning!", client.icons.warningRed] : args.author,
        colour: args.danger ? client.colours.error : undefined,
        description: args.description,
        fields: args.fields
      },
      ...(args.embeds ?? [])
    ],
    fetch: true,
    components: [makeRow({
      buttons: [
        {
          label: args.text ?? "Confirm",
          customId: "yes",
          style: args.danger ? "red" : "green",
          emoji: args.emoji ?? client.emotes.tickWhite
        },
        {
          label: args.cancel ?? "Cancel",
          emoji: client.emotes.crossWhite,
          customId: "no"
        }
      ]
    })],
    processing: args.processing
  }
  if (args.private) {
    await sendPrivateMessage(message, contents)
    confirmMessage = message.message
    message = args.message
  }
  else confirmMessage = await sendMessage(message, contents)
  let timeout = true
  return new Promise(async fulfil => {
    await interactionHandler(confirmMessage, (interaction, collector) => {
      if (args.private || interaction.user.id === message.author.id) {
        interaction.deferUpdate().catch(() => {})
        timeout = false
        collector.stop()
        if (interaction.customId === "yes") fulfil([true, confirmMessage])
        else fulfil([false, confirmMessage])
      } else {
        sendPrivateMessage(interaction, { description: "Only the command author can do that" })
      }
    }, { keep: args.keep })
    if (timeout) fulfil([null, confirmMessage])
  })
})