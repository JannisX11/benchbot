registerFunction(scriptName, async (message, processing, args = {}) => {
  if (processing) return processing
  if (message.command.application) return await message.deferReply({ ephemeral: args.ephemeral })
  const msg = await sendMessage(message, {
    author: ["Processing...", client.icons.pinging],
    processing,
    components: []
  })
  return msg ?? true
})