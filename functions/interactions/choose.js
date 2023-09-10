registerFunction(scriptName, async (message, args) => {
  const buttons = []
  if (args.emoji) for (let x = 0; x < args.options.length; x++) buttons.push({
    emoji: args.options[x],
    customId: x.toString()
  })
  else for (let x = 0; x < args.options.length; x++) buttons.push({
    label: args.options[x],
    customId: x.toString()
  })
  const components = []
  for (let x = 0; x < buttons.length; x++) {
    if (x % 5 === 0) components.push([])
    components[Math.floor(x / 5)].push(buttons[x])
  }
  const optionMessage = await sendMessage(message, {
    title: args.title,
    description: args.description,
    components: components.map(e => makeRow({ buttons: e })),
    processing: args.message,
    fields: args.fields,
    fetch: true
  })
  let timeout = true
  return new Promise(async fulfil => {
    await interactionHandler(optionMessage, (interaction, collector) => {
      if (interaction.user.id === message.author.id) {
        interaction.deferUpdate()
        timeout = false
        collector.stop()
        fulfil([interaction.customId, optionMessage])
      } else {
        sendPrivateMessage(interaction, { description: "Only the command author can do that" })
      }
    }, { keep: args.keep })
    if (timeout) {
      editMessage(optionMessage, {
        description: "The command timed out...",
        components: []
      }).catch(() => {})
      fulfil(null)
    }
  })
})